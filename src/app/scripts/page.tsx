import { prisma } from "@/lib/prisma";
import { QuickRepliesView } from "./ClientComponents";
import { getUser, checkDepartmentAccess } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const DEFAULT_KLINIK_SERVICES = [
  "Dolgu",
  "Botoks",
  "İp askı",
  "Sıvı Yüz germe",
  "Full Face",
  "Yüz şekillendirme dolguları",
  "9 Nokta Lifting",
  "PRP",
  "Burun dolgusu",
  "Fox Eyes",
  "Lipoliz",
  "Diğer"
];

const DEFAULT_CATEGORIES = [
  "Kampanyalar",
  "İşlemler ve Ürünler",
  "Randevu ve Destek",
  "Şikayet ve Kapsam Dışı",
  "Klinik ve Ödeme",
  "Diğer"
];

export default async function ScriptsPage(props: { searchParams: Promise<{ dept?: string }> }) {
    const searchParams = await props.searchParams;
    const dept = searchParams.dept || 'KLINIK';

    const hasAccess = await checkDepartmentAccess(dept);
    if (!hasAccess) {
        redirect("/");
    }

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "QuickReply" ADD COLUMN IF NOT EXISTS "topic" TEXT DEFAULT 'İşlem Detayı';`);
    } catch (e) {
        console.error("Auto-migration error for topic column:", e);
    }

    let categoriesList = await prisma.quickReplyCategory.findMany({ 
        where: { department: dept },
        orderBy: { order: 'asc' } 
    });

    const seedCategories = dept === 'KLINIK' ? DEFAULT_KLINIK_SERVICES : DEFAULT_CATEGORIES;

    try {
        if (categoriesList.length === 0) {
            // Seed default categories for this department
            await prisma.quickReplyCategory.createMany({
                data: seedCategories.map((c, i) => ({ name: c, order: i, department: dept })),
                skipDuplicates: true
            });
            categoriesList = await prisma.quickReplyCategory.findMany({ 
                where: { department: dept },
                orderBy: { order: 'asc' } 
            });
        } else if (dept === 'KLINIK') {
            const existingNames = new Set(categoriesList.map(c => c.name));
            const missing = DEFAULT_KLINIK_SERVICES.filter(s => !existingNames.has(s));
            if (missing.length > 0) {
                const startOrder = categoriesList.length;
                await prisma.quickReplyCategory.createMany({
                    data: missing.map((name, i) => ({ name, order: startOrder + i, department: dept })),
                    skipDuplicates: true
                });
                categoriesList = await prisma.quickReplyCategory.findMany({ 
                    where: { department: dept },
                    orderBy: { order: 'asc' } 
                });
            }
        }
    } catch (e) {
        console.error("Error seeding categories:", e);
    }
    
    // Add "Tümü" to the end as a synthetic option.
    const categories = [...categoriesList.map(c => c.name), "Tümü"];
    // But we need the objects for the edit modal.
    const rawCategories = categoriesList;

    const quickReplies = await prisma.quickReply.findMany({ 
        where: { department: dept },
        orderBy: [{ order: 'asc' }, { title: 'asc' }] 
    });
    const user = await getUser();

    return (
        <div className="p-4 md:p-8 max-w-[1700px] w-full mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">{dept === 'GUZELLIK' ? 'Güzellik Merkezi' : (dept === 'DENTAL' ? 'DP Dental' : 'Klinik')} Hızlı Yanıtlar</h1>
                <p className="text-slate-500 mt-2">{dept === 'GUZELLIK' ? 'Güzellik Merkezi' : (dept === 'DENTAL' ? 'DP Dental' : 'Klinik')} sık sorulan sorular için hazır mesaj şablonları.</p>
            </div>

            <div className="relative">
                <QuickRepliesView quickReplies={quickReplies} user={user} categories={categories} rawCategories={rawCategories} department={dept} />
            </div>
        </div>
    );
}
