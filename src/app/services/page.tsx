import { prisma } from "@/lib/prisma";
import { ServiceForm } from "./ServiceForm";
import { DeleteServiceButton } from "./DeleteServiceButton";

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    const services = await prisma.service.findMany({
        orderBy: [
            { category: 'asc' },
            { name: 'asc' }
        ]
    });

    const categories = Array.from(new Set(services.map(s => s.category)));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Hizmetler ve Fiyatlar</h1>
                    <p className="text-slate-500 mt-2">
                        Güncel liste ve kampanya fiyatlarını yönetin.
                    </p>
                </div>
            </div>

            <ServiceForm />

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
                                    <th className="px-6 py-3 font-medium w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {services.filter(s => s.category === category).map(service => (
                                    <tr key={service.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-slate-900 font-medium">{service.name}</td>
                                        <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">
                                            <span className="line-through decoration-slate-300">₺{service.listPrice?.toLocaleString('tr-TR')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                                ₺{service.campaignPrice?.toLocaleString('tr-TR')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <DeleteServiceButton id={service.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
}
