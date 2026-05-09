"use client";

import { useState, useTransition } from "react";
import { Search, Plus, Trash2, Loader2, Edit2 } from "lucide-react";
import { addAnnouncement, deleteAnnouncement, updateAnnouncement } from "./actions";
import RichTextEditor from "./components/RichTextEditor";



type Announcement = {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
};

function AnnouncementForm({ user, editingItem, onClose, department }: { user: any, editingItem?: Announcement | null, onClose?: () => void, department: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState(editingItem?.content || "");

    const isEdit = !!editingItem;
    const active = isOpen || isEdit;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;

        if (!content || content === "<p></p>") {
            alert("İçerik boş olamaz.");
            return;
        }

        startTransition(async () => {
            if (isEdit) {
                await updateAnnouncement(editingItem.id, { title, content });
                if (onClose) onClose();
            } else {
                await addAnnouncement({ title, content, department });
                setIsOpen(false);
                setContent("");
            }
        });
    }

    if (!active) {
        return (
            <div className="flex justify-center mt-4 mb-8 relative z-20">
                <button
                    onClick={() => {
                        if (!user) {
                            alert("Bu işlemi gerçekleştirmek için sol alttaki menüden sisteme giriş yapmalısınız.");
                            return;
                        }
                        setIsOpen(true);
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 ${department === 'GUZELLIK' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-slate-900 hover:bg-slate-800'} text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg`}
                >
                    <Plus size={18} />
                    Yeni {department === 'GUZELLIK' ? 'Güzellik Merkezi' : 'Klinik'} Duyurusu Ekle
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-md mb-10 w-full max-w-5xl mx-auto relative z-20">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-800">
                    {isEdit ? "Duyuruyu Düzenle" : `Yeni ${department === 'GUZELLIK' ? 'Güzellik Merkezi' : 'Klinik'} İçeriği`}
                </h3>
                <button 
                    onClick={() => {
                        if (isEdit && onClose) onClose();
                        else setIsOpen(false);
                    }} 
                    className="text-slate-400 hover:text-slate-600 font-medium"
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Başlık</label>
                    <input
                        required
                        name="title"
                        type="text"
                        defaultValue={editingItem?.title || ""}
                        placeholder={department === 'GUZELLIK' ? "Örn: Cilt Bakımı Kampanyası" : "Örn: Nisan Ayı Özel Lazer Kampanyası"}
                        className="w-full border-slate-300 border rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">İçerik Detayları</label>
                    <RichTextEditor content={content} onChange={setContent} />
                </div>

                <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={isPending} className={`w-full sm:w-auto px-8 py-3 ${department === 'GUZELLIK' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}>
                        {isPending && <Loader2 size={18} className="animate-spin" />}
                        {isEdit ? "Değişiklikleri Kaydet" : "İçeriği Yayınla"}
                    </button>
                </div>
            </form>
        </div>
    );
}


function DeleteAnnouncementButton({ id, user }: { id: string, user: any }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (!user) {
                    alert("Bu işlemi gerçekleştirmek için sol alttaki menüden sisteme giriş yapmalısınız.");
                    return;
                }
                startTransition(() => deleteAnnouncement(id));
            }}
            disabled={isPending}
            className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-sm text-red-500 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100 disabled:opacity-50 shadow-sm"
            title="Duyuruyu Sil"
        >
            <Trash2 size={18} />
        </button>
    );
}

export function AnnouncementsClient({ initialData, user, department }: { initialData: Announcement[], user: any, department: string }) {
    const [search, setSearch] = useState("");
    const [editingItem, setEditingItem] = useState<Announcement | null>(null);

    const filtered = initialData.filter(item => {
        const q = search.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
    });

    return (
        <div className="flex flex-col flex-1 relative bg-slate-50">
            {/* Form */}
            {editingItem ? (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        <AnnouncementForm 
                            user={user} 
                            editingItem={editingItem} 
                            onClose={() => setEditingItem(null)} 
                            department={department}
                        />
                    </div>
                </div>
            ) : (
                <AnnouncementForm user={user} department={department} />
            )}


            {/* Sticky Search Bar */}
            <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm pb-6 pt-2 border-b border-slate-200">
                <div className="relative max-w-4xl mx-auto w-full px-4 sm:px-0">
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
            <div className="py-8 max-w-7xl mx-auto w-full flex flex-col gap-8 px-4 sm:px-0">
                {filtered.map(item => (
                    <div key={item.id} className="relative bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col group hover:shadow-md transition-shadow">
                        {user && (
                            <div className="absolute top-6 right-6 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-2 bg-white/80 backdrop-blur-sm text-blue-500 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors shadow-sm"
                                    title="Düzenle"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <DeleteAnnouncementButton id={item.id} user={user} />
                            </div>
                        )}


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

                        <div 
                            className="prose prose-slate max-w-none prose-img:rounded-2xl prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-slate-100"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />

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
