import Image from 'next/image';

const employees = [
    {
        name: "Esma Sevinç Eravcı",
        department: "Klinik / İdari Müdür",
        startDate: "04.01.2026",
        image: "/team/esma.png"
    }
];

export default function EmployeesPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Çalışanlarımız</h1>
                <p className="text-slate-500 mt-2">
                    Klinik ekibimiz ve yöneticilerimiz
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {employees.map((emp, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="relative w-full h-80 bg-slate-100">
                            {emp.image ? (
                                <Image
                                    src={emp.image}
                                    alt={emp.name}
                                    fill
                                    className="object-cover object-top"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
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
            </div>
        </div>
    );
}
