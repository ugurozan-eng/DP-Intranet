import { prisma } from "@/lib/prisma";
import { QuickRepliesView } from "./ClientComponents";
import { getUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  "Kampanyalar",
  "İşlemler ve Ürünler",
  "Randevu ve Destek",
  "Şikayet ve Kapsam Dışı",
  "Klinik ve Ödeme",
  "Diğer"
];

export default async function ScriptsPage() {
    let categoriesList = await prisma.quickReplyCategory.findMany({ orderBy: { order: 'asc' } });
    if (categoriesList.length === 0) {
        // Seed default categories
        await prisma.quickReplyCategory.createMany({
            data: DEFAULT_CATEGORIES.map((c, i) => ({ name: c, order: i }))
        });
        categoriesList = await prisma.quickReplyCategory.findMany({ orderBy: { order: 'asc' } });
    }
    
    // Add "Tümü" to the end as a synthetic option.
    const categories = [...categoriesList.map(c => c.name), "Tümü"];
    // But we need the objects for the edit modal.
    const rawCategories = categoriesList;

    const quickReplies = await prisma.quickReply.findMany({ orderBy: [{ order: 'asc' }, { title: 'asc' }] });
    const user = await getUser();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Hızlı Yanıtlar</h1>
                <p className="text-slate-500 mt-2">Sık sorulan sorular için hazır mesaj şablonları.</p>
            </div>

            <div className="relative">
                <QuickRepliesView quickReplies={quickReplies} user={user} categories={categories} rawCategories={rawCategories} />
            </div>
        </div>
    );
}
