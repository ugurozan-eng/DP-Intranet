import Image from 'next/image';
import { prisma } from "@/lib/prisma";
import { EmployeeForm, DeleteEmployeeButton } from "./ClientComponents";
import { getUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function EmployeesPage() {
    const user = await getUser();
    const employees = await prisma.employee.findMany({
        orderBy: {
            createdAt: 'asc'
        }
    });

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col min-h-screen">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Çalışanlarımız</h1>
                    <p className="text-slate-500 mt-2">
                        Klinik ekibimiz ve yöneticilerimiz
                    </p>
                </div>
            </div>

            <EmployeeForm user={user} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                {employees.map((emp: any) => (
                    <div key={emp.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group relative">
                        {user ? (
                            <DeleteEmployeeButton id={emp.id} user={user} />
                        ) : (
                            <DeleteEmployeeButton id={emp.id} user={user} />
                        )}
                        <div className="relative w-full h-80 bg-slate-100 flex items-center justify-center">
                            {emp.photoBase64 ? (
                                <Image
                                    src={emp.photoBase64}
                                    alt={emp.name}
                                    fill
                                    className="object-cover object-center"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="text-slate-400">
                                    Fotoğraf Yok
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-800">{emp.name}</h2>
                            <p className="text-indigo-600 font-medium mb-4">{emp.department}</p>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-500 flex justify-between">
                                    <span className="font-medium text-slate-600">İşe Giriş Tarihi:</span>
                                    <span>{emp.startDate}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {employees.length === 0 && (
                    <div className="col-span-full text-center py-16 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                        Henüz personel eklenmemiş. Yukarıdaki formu kullanarak ekleyebilirsiniz.
                    </div>
                )}
            </div>
        </div>
    );
}
