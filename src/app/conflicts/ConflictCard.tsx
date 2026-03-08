"use client";

import { useState, useTransition } from "react";
import { resolveConflict } from "./actions";
import { Plus, X, Check } from "lucide-react";

type ConflictCardProps = {
    chatId: string;
    contactName: string;
    phoneNumber: string;
    lastDate: string;
    prices: string[];
    products: string[];
};

export function ConflictCard({ chatId, contactName, phoneNumber, lastDate, prices, products }: ConflictCardProps) {
    const [isPending, startTransition] = useTransition();
    const [editablePrices, setEditablePrices] = useState<string[]>(prices);
    const [newPrice, setNewPrice] = useState("");

    const handleResolve = (price: string) => {
        startTransition(async () => {
            await resolveConflict(chatId, price);
        });
    };

    const handleRemove = (idx: number) => {
        setEditablePrices(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAdd = () => {
        if (newPrice.trim() && !editablePrices.includes(newPrice.trim())) {
            setEditablePrices(prev => [...prev, newPrice.trim()]);
            setNewPrice("");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-slate-800">{contactName}</h3>
                    <p className="text-sm text-slate-500">{phoneNumber}</p>
                </div>
                <div className="text-sm bg-white px-3 py-1 rounded-full text-slate-600 border border-slate-200 shadow-sm">
                    {lastDate}
                </div>
            </div>
            {products && products.length > 0 && (
                <div className="px-6 py-3 bg-indigo-50/50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest shrink-0">Bahsedilenler:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {products.map((prod, i) => (
                            <span key={i} className="px-2.5 py-0.5 bg-white border border-indigo-100 shadow-sm text-indigo-700 text-xs font-semibold rounded-full capitalize">
                                {prod}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <div className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-3">Detected Prices (Click <Check className="inline h-4 w-4 bg-emerald-100 text-emerald-600 rounded-sm mb-1" /> to select the correct one or <X className="inline h-4 w-4 bg-red-100 text-red-600 rounded-sm mb-1" /> to remove):</p>
                <div className="flex flex-wrap gap-3 mb-4">
                    {editablePrices.map((price, idx) => (
                        <div key={idx} className="flex items-center gap-1 px-1 py-1 bg-slate-50 border border-slate-200 rounded-lg group">
                            <input
                                type="text"
                                value={price}
                                onChange={(e) => {
                                    const newPrices = [...editablePrices];
                                    newPrices[idx] = e.target.value;
                                    setEditablePrices(newPrices);
                                }}
                                className="px-2 py-1 bg-transparent text-sm font-medium text-slate-700 outline-none w-24 shrink-0 focus:border-blue-500 border border-transparent rounded-md focus:bg-white"
                            />
                            <button
                                onClick={() => handleResolve(price)}
                                disabled={isPending}
                                title="Set as correct price"
                                className="p-1.5 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700 rounded-md transition-colors disabled:opacity-50"
                            >
                                <Check size={16} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => handleRemove(idx)}
                                title="Remove price"
                                className="p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors disabled:opacity-50"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add new price input */}
                <div className="flex items-center gap-2 max-w-[250px]">
                    <input
                        type="text"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Yeni fiyat ekle..."
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newPrice.trim()}
                        className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title="Ekle"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
}
