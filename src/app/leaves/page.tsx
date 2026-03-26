import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { LeaveDashboard, ActionBtns, StatusBadge } from "./ClientComponents";

export const dynamic = 'force-dynamic';

export default async function LeavesPage() {
    const user = await getUser();

    let whereClause: any = {};
    
    if (!user) {
        whereClause = { id: "none" };
    } else if (user.role === "ADMIN") {
        whereClause = {};
    } else if (user.role === "MANAGER") {
        whereClause = {
            OR: [
                { managerId: user.id },
                { userId: user.id }
            ]
        };
    } else if (user.role === "ACCOUNTING") {
        whereClause = {
            OR: [
                { status: { in: ["PENDING_ACCOUNTING", "COMPLETED", "REJECTED"] } },
                { userId: user.id }
            ]
        };
    } else {
        whereClause = { userId: user.id };
    }

    const leaves = await prisma.leave.findMany({
        where: whereClause,
        include: {
            user: { select: { email: true, name: true } },
            manager: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">İzin Formları</h1>
                    <p className="text-slate-500 mt-2">
                        Personel izin taleplerinde bulunun ve onay süreçlerini takip edin.
                    </p>
                </div>
            </div>

            <LeaveDashboard user={user}>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden pb-4 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider font-semibold text-slate-500">
                            <th className="px-6 py-4">Kayıt Tarihi</th>
                            <th className="px-6 py-4">Personel</th>
                            <th className="px-6 py-4">İzin Türü</th>
                            <th className="px-6 py-4 text-center">İzin Tarihleri</th>
                            <th className="px-6 py-4">Mazeret/Açıklama</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {leaves.map((leave) => {
                            const isOwn = user?.id === leave.userId;
                            return (
                                <tr key={leave.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                                        {new Date(leave.createdAt).toLocaleDateString("tr-TR")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">{leave.user.name || leave.user.email.split('@')[0]}</span>
                                            {isOwn ? (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded w-fit mt-1 font-bold">BANA AİT</span>
                                            ) : (
                                                <span className="text-xs text-slate-500">{leave.manager ? `Amir: ${leave.manager.name}` : ''}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md text-xs whitespace-nowrap">{leave.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center justify-center bg-slate-50/50 border border-slate-200 rounded-md py-1 px-2 whitespace-nowrap text-xs font-mono">
                                            <span className="text-slate-700">{new Date(leave.startDate).toLocaleDateString("tr-TR")}</span>
                                            <span className="text-slate-400 text-[10px] leading-tight">ile</span>
                                            <span className="text-slate-700">{new Date(leave.endDate).toLocaleDateString("tr-TR")}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]" title={leave.description}>
                                        {leave.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={leave.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            {user && (
                                                <ActionBtns 
                                                    leaveId={leave.id}
                                                    status={leave.status}
                                                    userRole={user.role}
                                                    isOwn={isOwn}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {leaves.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 border border-dashed border-slate-300">
                                    {user 
                                        ? "Henüz herhangi bir izin talebi bulunmuyor." 
                                        : "İzin taleplerini görüntülemek için sisteme giriş yapmalısınız."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            </LeaveDashboard>
        </div>
    );
}
