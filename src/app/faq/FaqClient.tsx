"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { addFaq, updateFaq, deleteFaq, updateFaqOrders } from "./actions";
import { Trash2, Copy, Check, Search, GripVertical } from "lucide-react";

export function FaqClient({ faqs, user }: { faqs: any[], user: any }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [localFaqs, setLocalFaqs] = useState(faqs);
    const [draggedItem, setDraggedItem] = useState<any>(null);
    const [dragOverItem, setDragOverItem] = useState<any>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setLocalFaqs(faqs);
    }, [faqs]);

    const filteredFaqs = localFaqs.filter(faq => {
        const query = searchQuery.toLowerCase();
        return faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query);
    });

    const handleDragStart = (e: React.DragEvent, faq: any) => {
        if (!user) {
            e.preventDefault();
            return;
        }
        setDraggedItem(faq);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, faq: any) => {
        e.preventDefault();
        if (!user || !draggedItem || draggedItem.id === faq.id) return;
        setDragOverItem(faq);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDrop = (e: React.DragEvent, targetFaq: any) => {
        e.preventDefault();
        if (!user || !draggedItem || draggedItem.id === targetFaq.id) {
            handleDragEnd();
            return;
        }

        const newLocal = [...localFaqs];
        const draggedIdx = newLocal.findIndex(r => r.id === draggedItem.id);
        const targetIdx = newLocal.findIndex(r => r.id === targetFaq.id);

        if (draggedIdx === -1 || targetIdx === -1) {
            handleDragEnd();
            return;
        }

        const [movedItem] = newLocal.splice(draggedIdx, 1);
        newLocal.splice(targetIdx, 0, movedItem);

        setLocalFaqs(newLocal);
        handleDragEnd();

        const updates = newLocal.map((r, i) => ({ id: r.id, order: i }));
        startTransition(() => {
            updateFaqOrders(updates);
        });
    };

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Sorularda veya cevaplarda arayın..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <FaqForm user={user} />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {filteredFaqs.map(faq => (
                    <div
                        key={faq.id}
                        draggable={!!user}
                        onDragStart={(e) => handleDragStart(e, faq)}
                        onDragOver={(e) => handleDragOver(e, faq)}
                        onDrop={(e) => handleDrop(e, faq)}
                        onDragEnd={handleDragEnd}
                        className={`transition-all duration-200 ${dragOverItem?.id === faq.id ? 'opacity-80 scale-[1.01] ring-2 ring-blue-400 rounded-xl' : 'opacity-100'} ${draggedItem?.id === faq.id ? 'opacity-40' : ''}`}
                    >
                        <EditableFaqCard faq={faq} user={user} />
                    </div>
                ))}
            </div>

            {filteredFaqs.length === 0 && (
                <div className="text-center py-12 rounded-xl border border-dashed border-slate-300 text-slate-500 mt-6 bg-white">
                    {searchQuery 
                        ? "Aramanıza uygun soru/cevap bulunamadı." 
                        : "Kayıtlı soru/cevap bulunmuyor."}
                </div>
            )}
        </div>
    );
}

function EditableFaqCard({ faq, user }: { faq: any, user: any }) {
    const [question, setQuestion] = useState(faq.question);
    const [answer, setAnswer] = useState(faq.answer);
    const [isPending, startTransition] = useTransition();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const savedHeight = localStorage.getItem(`faq-textarea-height-${faq.id}`);
        if (savedHeight && textareaRef.current) {
            textareaRef.current.style.height = savedHeight;
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === textareaRef.current) {
                    const inlineHeight = (entry.target as HTMLElement).style.height;
                    if (inlineHeight) {
                        localStorage.setItem(`faq-textarea-height-${faq.id}`, inlineHeight);
                    }
                }
            }
        });

        if (textareaRef.current) {
            resizeObserver.observe(textareaRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [faq.id]);

    const handleQuestionBlur = (val: string) => {
        if (!user) return;
        const trimmed = val.trim();
        if (!trimmed || trimmed === faq.question) {
            setQuestion(faq.question);
            return;
        }
        startTransition(async () => {
            await updateFaq(faq.id, { question: trimmed });
        });
    };

    const handleAnswerBlur = (val: string) => {
        if (!user) return;
        const trimmed = val.trim();
        if (!trimmed || trimmed === faq.answer) {
            setAnswer(faq.answer);
            return;
        }
        startTransition(async () => {
            await updateFaq(faq.id, { answer: trimmed });
        });
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col relative group transition-all ${user ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'hover:shadow-md'} h-full`}>
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl font-medium text-slate-800 relative flex items-center pr-24">
                {user && <GripVertical size={16} className="text-slate-300 mr-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onBlur={(e) => handleQuestionBlur(e.target.value)}
                    readOnly={!user}
                    placeholder="Soru"
                    className={`bg-transparent outline-none w-full font-semibold transition-colors ${user ? 'hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 px-3 py-1.5 -ml-3 rounded-lg cursor-text' : 'cursor-default text-lg'}`}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 flex opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-slate-200 rounded-lg shrink-0">
                    <CopyBtn text={answer} />
                    {user && (
                        <>
                            <div className="w-px bg-slate-200"></div>
                            <DelBtn id={faq.id} user={user} />
                        </>
                    )}
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onBlur={(e) => handleAnswerBlur(e.target.value)}
                    readOnly={!user}
                    rows={3}
                    placeholder="Cevap"
                    className={`w-full text-[15px] leading-relaxed text-slate-700 outline-none resize-y ${user ? 'hover:bg-slate-50 focus:bg-slate-50 focus:ring-2 focus:ring-blue-100 p-3 -m-3 rounded-lg transition-colors' : 'bg-transparent cursor-default'}`}
                />
            </div>
        </div>
    );
}

function FaqForm({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            await addFaq({
                question: formData.get("question") as string,
                answer: formData.get("answer") as string,
            });
            setIsOpen(false);
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
                className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
            >
                + Yeni Soru Ekle
            </button>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl absolute z-20 top-0 right-0 sm:right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 md:top-20">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-800">Yeni Soru ve Cevap</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Soru</label>
                    <input required name="question" type="text" placeholder="Örn: Çalışma saatleriniz nedir?" className="w-full border-slate-300 border rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cevap</label>
                    <textarea required name="answer" rows={5} placeholder="Cevabı buraya yazın..." className="w-full border-slate-300 border rounded-xl px-4 py-3 text-slate-900 resize-y focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={isPending} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Cevabı Kopyala"
        >
            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
        </button>
    );
}

function DelBtn({ id, user }: { id: string, user?: any }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            onClick={() => {
                if (!user) {
                    alert("Bu işlemi gerçekleştirmek için sol alttaki menüden sisteme giriş yapmalısınız.");
                    return;
                }
                if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
                    startTransition(() => deleteFaq(id));
                }
            }}
            disabled={isPending}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Sil"
        >
            <Trash2 size={18} />
        </button>
    );
}
