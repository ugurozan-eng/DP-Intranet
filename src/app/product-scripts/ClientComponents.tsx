"use client";

import { useState, useTransition } from "react";
import { addScript, deleteScript, updateScript } from "./actions";
import { Trash2, Copy, Check, Loader2 } from "lucide-react";

export function ScriptForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const data = {
                name: formData.get("name") as string,
                content: formData.get("content") as string,
            };
            await addScript(data);
            setIsOpen(false);
        });
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
                + Sayfaya İşlem Ekle
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Yeni İşlem Scripti Ekle</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">İşlem Adı</label>
                    <input required name="name" type="text" placeholder="Örn: Fraksiyonel Lazer" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Satış / Bilgilendirme Scripti</label>
                    <textarea required name="content" rows={4} placeholder="Örn: Cilt yenileme amacıyla kullanılan bir lazer uygulamasıdır..." className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                </div>
                <button type="submit" disabled={isPending} className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
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
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
            title="Kopyala"
        >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
    );
}

export function DeleteScriptButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            onClick={() => startTransition(() => deleteScript(id))}
            disabled={isPending}
            className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
            title="Sil"
        >
            <Trash2 size={14} />
        </button>
    );
}

export function EditableScriptRow({ script }: { script: any }) {
    const [name, setName] = useState(script.name);
    const [content, setContent] = useState(script.content);
    const [isPending, startTransition] = useTransition();

    const handleNameBlur = (val: string) => {
        const trimmed = val.trim();
        if (!trimmed || trimmed === script.name) {
            setName(script.name);
            return;
        }

        startTransition(async () => {
            await updateScript(script.id, { name: trimmed });
        });
    };

    const handleContentBlur = (val: string) => {
        const trimmed = val.trim();
        if (!trimmed || trimmed === script.content) {
            setContent(script.content);
            return;
        }

        startTransition(async () => {
            await updateScript(script.id, { content: trimmed });
        });
    };

    return (
        <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
            <td className="px-6 py-4 relative group align-top border-r border-slate-100 sm:w-1/3">
                <div className="flex flex-col gap-2 relative">
                    <div className="flex items-center gap-2">
                        <textarea
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={(e) => handleNameBlur(e.target.value)}
                            rows={2}
                            className="bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded outline-none text-slate-900 font-bold px-2 py-1 w-full transition-all focus:ring-2 focus:ring-blue-100 resize-none overflow-hidden"
                        />
                        {isPending && <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />}
                    </div>
                    <div className="absolute -left-4 top-0 hidden sm:flex items-center gap-1 bg-slate-50/80 px-1 py-1 rounded-md shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyBtn text={name} />
                        <div className="w-px h-4 bg-slate-200"></div>
                        <DeleteScriptButton id={script.id} />
                    </div>
                    <div className="sm:hidden flex items-center gap-1 bg-slate-50/80 px-1 py-1 rounded-md shadow-sm border border-slate-100 w-fit">
                        <CopyBtn text={name} />
                        <div className="w-px h-4 bg-slate-200"></div>
                        <DeleteScriptButton id={script.id} />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 relative group align-top">
                <div className="flex items-start gap-4 justify-between h-full">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={(e) => handleContentBlur(e.target.value)}
                        rows={6}
                        className="bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded outline-none text-slate-700 w-full transition-all focus:ring-2 focus:ring-blue-100 px-2 py-1 resize-y"
                    />
                    <div className="sticky top-2">
                        <CopyBtn text={content} />
                    </div>
                </div>
            </td>
        </tr>
    );
}
