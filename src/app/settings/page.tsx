import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserForm, DeleteUserButton } from "./ClientComponents";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const user = await getUser();

    if (!user || user.role !== 'ADMIN') {
        redirect("/login");
    }

    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: 'asc'
        }
    });

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Ayarlar & Kullanıcılar</h1>
                <p className="text-slate-500 mt-2">
                    Sistem erişimi olan personelleri yönetin. Sadece Yönetici yetkisine sahip kişiler bu sayfayı görebilir.
                </p>
            </div>

            <UserForm />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-10">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">Sistem Kullanıcıları</h2>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 text-sm font-semibold text-slate-500">
                            <th className="px-6 py-4">Kullanıcı E-posta</th>
                            <th className="px-6 py-4">Yetki Grubu</th>
                            <th className="px-6 py-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                        {u.role === 'ADMIN' ? 'Yönetici (Admin)' : 'Standart Kullanıcı'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {u.id !== user.id && (
                                        <DeleteUserButton id={u.id} />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
