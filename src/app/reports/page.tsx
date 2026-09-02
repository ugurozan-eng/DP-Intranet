import { prisma } from "@/lib/prisma";
import { ensurePageViewTable } from "@/lib/analytics";
import { ReportsView } from "./ReportsView";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    await ensurePageViewTable();

    let pageViewsRaw: any[] = [];
    try {
        pageViewsRaw = await prisma.pageView.findMany({
            orderBy: { count: 'desc' }
        });
    } catch (e) {
        console.error("Error fetching pageViews:", e);
    }

    let quickRepliesRaw: any[] = [];
    try {
        quickRepliesRaw = await prisma.quickReply.findMany({
            where: { isArchived: false },
            orderBy: [{ copyCount: 'desc' }, { title: 'asc' }]
        });
    } catch (e) {
        console.error("Error fetching quickReplies for reports:", e);
    }

    const pageViews = pageViewsRaw.map(pv => ({
        id: pv.id,
        path: pv.path,
        department: pv.department || 'GENEL',
        count: pv.count,
        updatedAt: pv.updatedAt?.toISOString() || new Date().toISOString()
    }));

    const quickReplies = quickRepliesRaw.map(qr => ({
        id: qr.id,
        title: qr.title,
        topic: qr.topic || null,
        category: qr.category,
        department: qr.department,
        copyCount: qr.copyCount || 0
    }));

    return (
        <div className="p-4 md:p-8 max-w-[1700px] w-full mx-auto">
            <ReportsView pageViews={pageViews} quickReplies={quickReplies} />
        </div>
    );
}
