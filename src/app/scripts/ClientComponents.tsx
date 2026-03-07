"use client";

import { useState, useTransition } from "react";
import { addScript, addQuickReply, deleteScript, deleteQuickReply } from "./actions";
import { Trash2, Copy, Check } from "lucide-react";

export function ScriptForm() {
    const [isOpen, setIsOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await addScript({
            type: formData.get("type") as string,
            name: formData.get("name") as string,
            content: formData.get("content") as string,
        });
        setIsOpen(false);
    }

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                + Script Ekle
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Yeni Script Ekle</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
                        <select required name="type" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 bg-white">
                            <option value="Kampanya">Kampanya</option>
                            <option value="Satış Öncesi">Satış Öncesi</option>
                            <option value="Satış Sonrası">Satış Sonrası</option>
                            <option value="Kararsız Müşteri">Kararsız</option>
                            <option value="Diğer">Diğer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                        <input required name="name" type="text" placeholder="Örn: 8 Mart Kampanyası" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mesaj İçeriği</label>
                    <textarea required name="content" rows={4} className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 resize-none font-mono text-sm"></textarea>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Kaydet</button>
            </form>
        </div>
    );
}

export function QuickReplyForm() {
    const [isOpen, setIsOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await addQuickReply({
            title: formData.get("title") as string,
            content: formData.get("content") as string,
        });
        setIsOpen(false);
    }

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors mt-8">
                + Hızlı Yanıt Ekle
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 mt-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Yeni Hızlı Yanıt</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kısayol/Başlık</label>
                    <input required name="title" type="text" placeholder="Örn: Konum" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Yanıt İçeriği</label>
                    <textarea required name="content" rows={3} className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 resize-none font-mono text-sm"></textarea>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Kaydet</button>
            </form>
        </div>
    );
}

export function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Kopyala"
        >
            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
        </button>
    );
}

export function DelBtn({ id, isScript }: { id: string, isScript: boolean }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            onClick={() => startTransition(() => isScript ? deleteScript(id) : deleteQuickReply(id))}
            disabled={isPending}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Sil"
        >
            <Trash2 size={18} />
        </button>
    );
}
