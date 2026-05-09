import { prisma } from "@/lib/prisma";
import { QuickRepliesView } from "./ClientComponents";
import { getUser, checkDepartmentAccess } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  "Kampanyalar",
  "İşlemler ve Ürünler",
  "Randevu ve Destek",
  "Şikayet ve Kapsam Dışı",
  "Klinik ve Ödeme",
  "Diğer"
];

export default async function ScriptsPage({ searchParams }: { searchParams: { dept?: string } }) {
    const dept = searchParams.dept || 'KLINIK';

    const hasAccess = await checkDepartmentAccess(dept);
    if (!hasAccess) {
        redirect("/");
    }

    let categoriesList = await prisma.quickReplyCategory.findMany({ 
        where: { department: dept },
        orderBy: { order: 'asc' } 
    });

    if (categoriesList.length === 0) {
        // Seed default categories for this department
        await prisma.quickReplyCategory.createMany({
            data: DEFAULT_CATEGORIES.map((c, i) => ({ name: c, order: i, department: dept }))
        });
        categoriesList = await prisma.quickReplyCategory.findMany({ 
            where: { department: dept },
            orderBy: { order: 'asc' } 
        });
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
                <h1 className="text-3xl font-bold text-slate-900">{dept === 'GUZELLIK' ? 'Güzellik Merkezi' : 'Klinik'} Hızlı Yanıtlar</h1>
                <p className="text-slate-500 mt-2">{dept === 'GUZELLIK' ? 'Güzellik Merkezi' : 'Klinik'} sık sorulan sorular için hazır mesaj şablonları.</p>
            </div>

            <div className="relative">
                <QuickRepliesView quickReplies={quickReplies} user={user} categories={categories} rawCategories={rawCategories} department={dept} />
            </div>
        </div>
    );
}
