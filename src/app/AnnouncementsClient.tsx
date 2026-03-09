"use client";

import { useState, useTransition } from "react";
import { Search, Plus, Trash2, Loader2 } from "lucide-react";
import { addAnnouncement, deleteAnnouncement } from "./actions";

type Announcement = {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
};

function AnnouncementForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            await addAnnouncement({
                title: formData.get("title") as string,
                content: formData.get("content") as string,
            });
            setIsOpen(false);
        });
    }

    if (!isOpen) {
        return (
            <div className="flex justify-center mt-4 mb-8 relative z-20">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
                >
                    <Plus size={18} />
                    Yeni Duyuru / Kampanya Ekle
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-md mb-10 w-full max-w-3xl mx-auto relative z-20">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-800">Yeni İçerik Oluştur</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 font-medium">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Başlık</label>
                    <input
                        required
                        name="title"
                        type="text"
                        placeholder="Örn: Nisan Ayı Özel Lazer Kampanyası"
                        className="w-full border-slate-300 border rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">İçerik Detayları</label>
                    <textarea
                        required
                        name="content"
                        rows={6}
                        placeholder="Örn: 1 Nisan - 30 Nisan arası geçerli tüm şubelerde lazer işlemleri %20 indirimli..."
                        className="w-full border-slate-300 border rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                    />
                </div>

                <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={isPending} className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {isPending && <Loader2 size={18} className="animate-spin" />}
                        İçeriği Yayınla
                    </button>
                </div>
            </form>
        </div>
    );
}

function DeleteAnnouncementButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => startTransition(() => deleteAnnouncement(id))}
            disabled={isPending}
            className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-sm text-red-500 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100 disabled:opacity-50 shadow-sm"
            title="Duyuruyu Sil"
        >
            <Trash2 size={18} />
        </button>
    );
}

export function AnnouncementsClient({ initialData, user }: { initialData: Announcement[], user: any }) {
    const [search, setSearch] = useState("");

    const filtered = initialData.filter(item => {
        const q = search.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
    });

    return (
        <div className="flex flex-col flex-1 relative bg-slate-50">
            {/* Form */}
            {user && <AnnouncementForm />}

            {/* Sticky Search Bar */}
            <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm pb-6 pt-2 border-b border-slate-200">
                <div className="relative max-w-2xl mx-auto w-full px-4 sm:px-0">
                    <Search className="absolute left-8 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Duyurularda veya kampanyalarda arayın..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700"
                    />
                </div>
            </div>

            {/* Announcements Feed */}
            <div className="py-8 max-w-4xl mx-auto w-full flex flex-col gap-8 px-4 sm:px-0">
                {filtered.map(item => (
                    <div key={item.id} className="relative bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col group hover:shadow-md transition-shadow">
                        {user && <DeleteAnnouncementButton id={item.id} />}

                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight pr-12">
                                {item.title}
                            </h2>
                            <div className="hidden sm:block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap border border-blue-100">
                                {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                        <div className="sm:hidden mb-4 -mt-2">
                            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap border border-blue-100">
                                {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <pre className="text-slate-700 font-sans whitespace-pre-wrap text-[15px] leading-relaxed break-words bg-transparent border-0 p-0 m-0">
                                {item.content}
                            </pre>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
                        {search ? "Aramanıza uygun duyuru bulunamadı." : "Henüz duyuru veya kampanya eklenmemiş."}
                    </div>
                )}
            </div>
        </div>
    );
}
