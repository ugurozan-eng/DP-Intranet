"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { addEmployee, deleteEmployee } from "./actions";
import { Trash2, Upload, Loader2, Image as ImageIcon, Crop } from "lucide-react";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from "@/lib/cropImage";

export function EmployeeForm({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [photoData, setPhotoData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cropper states
    const [rawPhoto, setRawPhoto] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setRawPhoto(reader.result as string);
            setPhotoData(null);
        };
        reader.readAsDataURL(file);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const confirmCrop = useCallback(async () => {
        if (!rawPhoto || !croppedAreaPixels) return;
        try {
            const croppedImage = await getCroppedImg(rawPhoto, croppedAreaPixels);
            setPhotoData(croppedImage);
            setRawPhoto(null);
        } catch (e) {
            console.error(e);
        }
    }, [rawPhoto, croppedAreaPixels]);

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
            setRawPhoto(null);
        });
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => {
                    if (!user) {
                        alert("Bu işlemi gerçekleştirmek için sol alttaki menüden sisteme giriş yapmalısınız.");
                        return;
                    }
                    setIsOpen(true);
                }}
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
                <button onClick={() => { setIsOpen(false); setRawPhoto(null); setPhotoData(null); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {rawPhoto ? (
                <div className="space-y-4">
                    <div className="relative w-full h-64 bg-slate-900 rounded-lg overflow-hidden">
                        <Cropper
                            image={rawPhoto}
                            crop={crop}
                            zoom={zoom}
                            aspect={3 / 4}
                            onCropChange={setCrop}
                            onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels as any)}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setRawPhoto(null)}
                            className="flex-1 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            İptal
                        </button>
                        <button 
                            type="button" 
                            onClick={confirmCrop}
                            className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Crop size={16} /> Fotoğrafı Kes
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Photo Upload Area */}
                    <div className="flex justify-center">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={photoData 
                                ? "w-32 h-44 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 cursor-pointer overflow-hidden hover:bg-slate-100 transition-colors relative"
                                : "w-28 h-28 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 cursor-pointer overflow-hidden hover:bg-slate-100 transition-colors relative"
                            }
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
            )}
        </div>
    );
}

export function DeleteEmployeeButton({ id, user }: { id: string, user: any }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (!user) {
                    alert("Bu işlemi gerçekleştirmek için sol alttaki menüden sisteme giriş yapmalısınız.");
                    return;
                }
                startTransition(() => deleteEmployee(id));
            }}
            disabled={isPending}
            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-red-500 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100 disabled:opacity-50 shadow-sm"
            title="Çalışanı Sil"
        >
            <Trash2 size={18} />
        </button>
    );
}
