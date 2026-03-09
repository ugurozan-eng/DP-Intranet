import { prisma } from "@/lib/prisma";
import { QuickRepliesView } from "./ClientComponents";

export const dynamic = 'force-dynamic';

export default async function ScriptsPage() {
    const quickReplies = await prisma.quickReply.findMany({ orderBy: { title: 'asc' } });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Hızlı Yanıtlar</h1>
                <p className="text-slate-500 mt-2">Sık sorulan sorular için hazır mesaj şablonları.</p>
            </div>

            <div className="relative">
                <QuickRepliesView quickReplies={quickReplies} />
            </div>
        </div>
    );
}
