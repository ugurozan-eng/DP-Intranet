import { prisma } from "@/lib/prisma";
import { AnnouncementsClient } from "./AnnouncementsClient";
import { getUser, checkDepartmentAccess } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardPage(props: { searchParams: Promise<{ dept?: string }> }) {
  const searchParams = await props.searchParams;
  const dept = searchParams.dept || 'KLINIK';
  
  const hasAccess = await checkDepartmentAccess(dept);
  if (!hasAccess) {
    redirect("/"); // Or to a specific unauthorized page
  }

  const announcements = await prisma.announcement.findMany({
    where: { department: dept },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const user = await getUser();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col min-h-screen">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-slate-900">Duyurular / Kampanyalar</h1>
        <p className="text-slate-500 mt-2">
          {dept === 'GUZELLIK' ? 'Güzellik Merkezi' : 'Klinik'} içi güncel duyurular, kampanya bilgileri ve önemli mesajlar
        </p>
      </div>

      <AnnouncementsClient initialData={announcements} user={user} department={dept} />
    </div>
  );
}
