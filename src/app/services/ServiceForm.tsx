"use client";

import { useState } from "react";
import { addService } from "./actions";

export function ServiceForm({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            category: formData.get("category") as string,
            name: formData.get("name") as string,
            listPrice: parseFloat(formData.get("listPrice") as string),
            campaignPrice: parseFloat(formData.get("campaignPrice") as string),
        };
        await addService(data);
        setIsOpen(false);
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
                + Sayfaya İşlem Ekle
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Yeni İşlem Ekle</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="category" value="Diğer İşlemler" />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">İşlem</label>
                    <input required name="name" type="text" placeholder="Örn: Tüm Vücut Lazer" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Liste Fiyatı (TL)</label>
                        <input required name="listPrice" type="number" step="0.01" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kampanyalı Fiyat (TL)</label>
                        <input required name="campaignPrice" type="number" step="0.01" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900" />
                    </div>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Kaydet
                </button>
            </form>
        </div>
    );
}
