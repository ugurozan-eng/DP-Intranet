"use client";

import { useState, useTransition } from "react";
import { createExpense, approveByManager, approveByAccounting, rejectExpense, deleteExpense } from "./actions";
import { Check, X, Trash2, Loader2, Plus } from "lucide-react";

const CATEGORIES = [
    "Ulaşım/Araç",
    "Öğle Yemeği & İkram",
    "Konaklama & Seyahat",
    "Kırtasiye & Ofis",
    "Eğitim / Etkinlik",
    "Diğer Masraflar"
];

export function ExpenseForm({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            await createExpense({
                category: formData.get("category") as string,
                amount: parseFloat(formData.get("amount") as string),
                description: formData.get("description") as string,
                date: new Date(formData.get("date") as string)
            });
            setIsOpen(false);
        });
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => {
                    if (!user) {
                        alert("Masraf girebilmek için sisteme giriş yapmalısınız.");
                        return;
                    }
                    setIsOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Plus size={18} />
                Yeni Masraf Formu Doldur
            </button>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-md mb-8 w-full max-w-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-800">Personel Masraf Girişi</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 font-medium">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Masraf Türü</label>
                        <select required name="category" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            <option value="">Seçiniz...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Fiş/Fatura Tarihi</label>
                        <input required name="date" type="date" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tutar (TL)</label>
                    <input required min="1" step="0.01" name="amount" type="number" placeholder="Örn: 250.50" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Açıklama / Detay</label>
                    <textarea required name="description" rows={3} placeholder="Örn: Müşteri ziyareti otopark ücreti..." className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"></textarea>
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        Onaya Gönder
                    </button>
                </div>
            </form>
        </div>
    );
}

export function ActionBtns({ expenseId, status, userRole, isOwn }: { expenseId: string, status: string, userRole: string, isOwn: boolean }) {
    const [isPending, startTransition] = useTransition();

    const isManager = userRole === 'MANAGER' || userRole === 'ADMIN';
    const isAccounting = userRole === 'ACCOUNTING' || userRole === 'ADMIN';

    return (
        <div className="flex items-center gap-2">
            {/* MANAGER APPROVAL */}
            {status === 'PENDING_MANAGER' && isManager && !isOwn && (
                <>
                    <button onClick={() => startTransition(() => approveByManager(expenseId))} disabled={isPending} className="flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md text-xs font-semibold transition-colors disabled:opacity-50">
                        <Check size={14} /> Amir Onayı
                    </button>
                    <button onClick={() => startTransition(() => rejectExpense(expenseId))} disabled={isPending} className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-semibold transition-colors disabled:opacity-50">
                        <X size={14} /> Reddet
                    </button>
                </>
            )}

            {/* ACCOUNTING APPROVAL */}
            {status === 'PENDING_ACCOUNTING' && isAccounting && (
                <>
                    <button onClick={() => startTransition(() => approveByAccounting(expenseId))} disabled={isPending} className="flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md text-xs font-semibold transition-colors disabled:opacity-50">
                        <Check size={14} /> Muhasebe Onayı (Öde)
                    </button>
                    <button onClick={() => startTransition(() => rejectExpense(expenseId))} disabled={isPending} className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-semibold transition-colors disabled:opacity-50">
                        <X size={14} /> Reddet
                    </button>
                </>
            )}

            {/* DELETE (Own PENDING_MANAGER or Admin) */}
            {(isOwn && status === 'PENDING_MANAGER') || userRole === 'ADMIN' ? (
                <button onClick={() => startTransition(() => deleteExpense(expenseId))} disabled={isPending} className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-red-500 rounded-md transition-colors disabled:opacity-50" title="Sil">
                    <Trash2 size={16} />
                </button>
            ) : null}
        </div>
    );
}

export function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'PENDING_MANAGER':
            return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Amir Onayı Bekliyor</span>;
        case 'PENDING_ACCOUNTING':
            return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Muhasebeye İletildi</span>;
        case 'COMPLETED':
            return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Ödendi / Tamamlandı</span>;
        case 'REJECTED':
            return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Reddedildi</span>;
        default:
            return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{status}</span>;
    }
}
