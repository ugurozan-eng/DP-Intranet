"use client";

import { useState, useTransition } from "react";
import { addFaq, deleteFaq } from "./actions";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

export function FaqForm() {
    const [isOpen, setIsOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await addFaq({
            question: formData.get("question") as string,
            answer: formData.get("answer") as string,
        });
        setIsOpen(false);
    }

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                + SSS Ekle
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Sık Sorulan Soru Ekle</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Soru</label>
                    <input required name="question" type="text" placeholder="Örn: Lazer epilasyon acıtır mı?" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cevap Standardı</label>
                    <textarea required name="answer" rows={4} className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 resize-none font-mono text-sm"></textarea>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Kaydet</button>
            </form>
        </div>
    );
}

export function FaqAccordionItem({ id, question, answer }: { id: string, question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-3 transition-all">
            <div
                className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-slate-800 text-lg flex-1 pr-4">{question}</span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            startTransition(() => deleteFaq(id));
                        }}
                        disabled={isPending}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Sil"
                    >
                        <Trash2 size={18} />
                    </button>
                    <div className="p-1 rounded-full bg-slate-100 text-slate-500">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-slate-600 whitespace-pre-wrap">{answer}</p>
                </div>
            )}
        </div>
    );
}
