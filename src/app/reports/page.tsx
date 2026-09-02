import { prisma } from "@/lib/prisma";
import { ensureAnalyticsTables } from "@/lib/analytics";
import { ReportsView } from "./ReportsView";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    try {
        await ensureAnalyticsTables();
    } catch (e) {
        console.error("ensureAnalyticsTables error:", e);
    }

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

    let userActivitiesRaw: any[] = [];
    try {
        userActivitiesRaw = await prisma.userActivity.findMany({
            orderBy: [{ copies: 'desc' }, { pageViews: 'desc' }]
        });
    } catch (e) {
        console.error("Error fetching userActivities for reports:", e);
    }

    const safeToISO = (val: any) => {
        if (!val) return new Date().toISOString();
        try {
            const d = new Date(val);
            if (isNaN(d.getTime())) return new Date().toISOString();
            return d.toISOString();
        } catch {
            return new Date().toISOString();
        }
    };

    const pageViews = (pageViewsRaw || []).map(pv => ({
        id: pv.id || String(Math.random()),
        path: pv.path || '/',
        department: pv.department || 'GENEL',
        count: typeof pv.count === 'number' ? pv.count : 1,
        updatedAt: safeToISO(pv.updatedAt)
    }));

    const quickReplies = (quickRepliesRaw || []).map(qr => ({
        id: qr.id,
        title: qr.title || 'Başlıksız',
        topic: qr.topic || null,
        category: qr.category || 'Diğer',
        department: qr.department || 'KLINIK',
        copyCount: typeof qr.copyCount === 'number' ? qr.copyCount : 0
    }));

    const userActivities = (userActivitiesRaw || []).map(ua => ({
        id: ua.id || String(Math.random()),
        userEmail: ua.userEmail || 'Misafir / Giriş Yapmamış',
        pageViews: typeof ua.pageViews === 'number' ? ua.pageViews : 0,
        copies: typeof ua.copies === 'number' ? ua.copies : 0,
        department: ua.department || 'GENEL',
        updatedAt: safeToISO(ua.updatedAt)
    }));

    return (
        <div className="p-4 md:p-8 max-w-[1700px] w-full mx-auto">
            <ReportsView 
                pageViews={pageViews} 
                quickReplies={quickReplies} 
                userActivities={userActivities} 
            />
        </div>
    );
}
