"use client";

import { useState, useTransition, useRef } from "react";
import { addEmployee, deleteEmployee } from "./actions";
import { Trash2, Upload, Loader2, Image as ImageIcon } from "lucide-react";

export function EmployeeForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [photoData, setPhotoData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setPhotoData(null);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoData(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            await addEmployee({
                name: formData.get("name") as string,
                department: formData.get("department") as string,
                startDate: formData.get("startDate") as string,
                photoBase64: photoData,
            });
            setIsOpen(false);
            setPhotoData(null);
        });
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
                + Yeni Çalışan Ekle
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 w-full max-w-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">Yeni Çalışan Ekle</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Photo Upload Area */}
                <div className="flex justify-center">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-28 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 cursor-pointer overflow-hidden hover:bg-slate-100 transition-colors relative"
                    >
                        {photoData ? (
                            <img src={photoData} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Upload className="text-slate-400 mb-1" size={20} />
                                <span className="text-[10px] font-medium text-slate-500 text-center px-2">Fotoğraf Seç</span>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                    <input required name="name" type="text" placeholder="Örn: Esma Sevinç Eravcı" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Departman & Görev</label>
                        <input required name="department" type="text" placeholder="Örn: Klinik / İdari Müdür" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">İşe Giriş Tarihi</label>
                        <input required name="startDate" type="text" placeholder="Örn: 04.01.2026" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={isPending} className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
}

export function DeleteEmployeeButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => deleteEmployee(id))}
            disabled={isPending}
            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-red-500 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100 disabled:opacity-50 shadow-sm"
            title="Çalışanı Sil"
        >
            <Trash2 size={18} />
        </button>
    );
}
