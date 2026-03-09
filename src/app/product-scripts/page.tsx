import { prisma } from "@/lib/prisma";
import { ScriptForm, EditableScriptRow } from "./ClientComponents";

export const dynamic = 'force-dynamic';

export default async function ProductScriptsPage() {
    const scripts = await prisma.script.findMany({
        orderBy: {
            createdAt: 'asc'
        }
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Bilgi / Satış Scriptleri</h1>
                    <p className="text-slate-500 mt-2">
                        Çağrı merkezi ve operasyon ekipleri için kampanya, fiyat ve işlem detay scriptleri
                    </p>
                </div>
            </div>

            <ScriptForm />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden pb-10">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
                            <th className="px-6 py-4 w-1/3 border-r border-slate-200">İşlem</th>
                            <th className="px-6 py-4">Satış / Bilgilendirme Scripti</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {scripts.map(s => (
                            <EditableScriptRow key={s.id} script={s} />
                        ))}

                        {scripts.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-6 py-12 text-center text-slate-500 border border-dashed border-slate-300">
                                    Henüz script eklenmedi. Yukarıdaki butonu kullanarak yeni script ekleyebilirsiniz.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
