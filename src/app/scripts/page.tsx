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

async function syncKlinikServices() {
    const OLD_GENERIC_CATEGORIES = [
        "Kampanyalar",
        "İşlemler",
        "Randevu ve Destek",
        "Randevu ve Bilgi Talebi",
        "İşlemler ve Ürünler",
        "Şikayet ve Kapsam Dışı",
        "Klinik ve Ödeme",
        "Ürünler Hakkında Det...",
        "Yönlendirme",
        "Dış Arama",
        "Satış Scriptleri",
        "İşlem Sonrası Şikayetler",
        "Çapraz Satış"
    ];

    try {
        // Remove old generic category records for KLINIK
        await prisma.quickReplyCategory.deleteMany({
            where: {
                department: 'KLINIK',
                name: { in: OLD_GENERIC_CATEGORIES }
            }
        });

        // Ensure DEFAULT_KLINIK_SERVICES are created
        const existing = await prisma.quickReplyCategory.findMany({ where: { department: 'KLINIK' } });
        const existingNames = new Set(existing.map(c => c.name));
        const missing = DEFAULT_KLINIK_SERVICES.filter(s => !existingNames.has(s));

        if (missing.length > 0) {
            const startOrder = existing.length;
            await prisma.quickReplyCategory.createMany({
                data: missing.map((name, i) => ({ name, order: startOrder + i, department: 'KLINIK' })),
                skipDuplicates: true
            });
        }

        // Auto-categorize existing Klinik quick replies into actual medical services
        const replies = await prisma.quickReply.findMany({ where: { department: 'KLINIK' } });
        for (const r of replies) {
            const text = (r.title + " " + r.content + " " + (r.category || "")).toLowerCase();
            let newCategory = r.category;
            let newTopic = r.topic || "İşlem Detayı";

            if (text.includes("kampanya") || text.includes("kmp")) {
                newCategory = "Kampanyalar";
                newTopic = "Kampanya";
            } else if (text.includes("botoks")) {
                newCategory = "Botoks";
            } else if (text.includes("dolgu") || text.includes("dudak") || text.includes("jawline") || text.includes("çene") || text.includes("ışık") || text.includes("ışıltı") || text.includes("yüz şekillendirme")) {
                newCategory = "Dolgu";
            } else if (text.includes("prp") || text.includes("mezoterapi")) {
                newCategory = "PRP";
            } else if (text.includes("sıvı yüz") || text.includes("yüz germe")) {
                newCategory = "Sıvı Yüz germe";
            } else if (text.includes("ip askı") || text.includes("fransız askı")) {
                newCategory = "İp askı";
            } else if (text.includes("full face")) {
                newCategory = "Full Face";
            } else if (text.includes("burun")) {
                newCategory = "Burun dolgusu";
            } else if (text.includes("fox eyes")) {
                newCategory = "Fox Eyes";
            } else if (text.includes("lipoliz")) {
                newCategory = "Lipoliz";
            } else if (text.includes("9 nokta") || text.includes("lifting")) {
                newCategory = "9 Nokta Lifting";
            } else if (OLD_GENERIC_CATEGORIES.includes(r.category)) {
                newCategory = "Diğer";
            }

            if (newCategory !== r.category || newTopic !== r.topic) {
                await prisma.quickReply.update({
                    where: { id: r.id },
                    data: { category: newCategory, topic: newTopic }
                });
            }
        }
    } catch (e) {
        console.error("Klinik services sync error:", e);
    }
}

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

    if (dept === 'KLINIK') {
        await syncKlinikServices();
    }

    let categoriesList = await prisma.quickReplyCategory.findMany({ 
        where: { department: dept },
        orderBy: { order: 'asc' } 
    });

    if (categoriesList.length === 0 && dept !== 'KLINIK') {
        try {
            await prisma.quickReplyCategory.createMany({
                data: DEFAULT_CATEGORIES.map((c, i) => ({ name: c, order: i, department: dept })),
                skipDuplicates: true
            });
            categoriesList = await prisma.quickReplyCategory.findMany({ 
                where: { department: dept },
                orderBy: { order: 'asc' } 
            });
        } catch (e) {
            console.error("Category seed error:", e);
        }
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
