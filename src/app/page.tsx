import { prisma } from "@/lib/prisma";
import { AnnouncementsClient } from "./AnnouncementsClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col min-h-screen">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-slate-900">Duyurular / Kampanyalar</h1>
        <p className="text-slate-500 mt-2">
          Klinik içi güncel duyurular, kampanya bilgileri ve önemli mesajlar
        </p>
      </div>

      {/* This client component holds the search input and the actual list of posts */}
      <AnnouncementsClient initialData={announcements} />

    </div>
  );
}
