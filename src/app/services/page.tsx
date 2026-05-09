import { prisma } from "@/lib/prisma";
import { ServiceForm } from "./ServiceForm";
import { EditableServiceRow } from "./EditableServiceRow";
import { Download } from "lucide-react";
import { getUser, checkDepartmentAccess } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ServicesPage({ searchParams }: { searchParams: { dept?: string } }) {
    const dept = searchParams.dept || 'KLINIK';
    
    const hasAccess = await checkDepartmentAccess(dept);
    if (!hasAccess) {
        redirect("/");
    }

    const user = await getUser();
    const services = await prisma.service.findMany({
        where: { department: dept },
        orderBy: [
            { category: 'asc' },
            { name: 'asc' }
        ]
    });

    const categories = Array.from(new Set(services.map(s => s.category)));

    categories.sort((a, b) => {
        const getWeight = (cat: string) => {
            if (cat === "Dolgu") return 1;
            if (cat.includes("Botoks")) return 2;
            return 3;
        };
        const wA = getWeight(a);
        const wB = getWeight(b);
        if (wA !== wB) return wA - wB;
        return a.localeCompare(b);
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{dept === 'GUZELLIK' ? 'Güzellik Merkezi' : 'Klinik'} İşlemler / Fiyatlar</h1>
                    <p className="text-slate-500 mt-2">
                        {dept === 'GUZELLIK' ? 'Güzellik Merkezi' : 'Klinik'} güncel liste ve kampanya fiyatlarını yönetin.
                    </p>
                </div>
                <a
                    href={`/api/export-services?dept=${dept}`}
                    download="islemler_fiyatlar.xlsx"
                    className={`flex items-center gap-2 px-4 py-2 ${dept === 'GUZELLIK' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-medium rounded-lg transition-colors shadow-sm`}
                >
                    <Download size={18} />
                    Excel İndir
                </a>
            </div>

            <ServiceForm user={user} department={dept} />

            <div className="grid gap-8">
                {categories.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <h3 className="text-lg font-medium text-slate-900">Henüz hizmet eklenmedi</h3>
                        <p className="text-slate-500 mt-1">Yukarıdaki butonu kullanarak yeni hizmet ekleyebilirsiniz.</p>
                    </div>
                )}

                {categories.map(category => (
                    <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">{category}</h2>
                        </div>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-sm font-semibold text-slate-500">
                                    <th className="px-6 py-3 font-medium">Hizmet Adı</th>
                                    <th className="px-6 py-3 font-medium w-48 hidden sm:table-cell">Liste Fiyatı</th>
                                    <th className="px-6 py-3 font-medium w-48">Kampanyalı Fiyat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {services.filter(s => s.category === category).map(service => (
                                    <EditableServiceRow key={service.id} service={service} user={user} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}
