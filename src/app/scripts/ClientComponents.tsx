"use client";

import { useState, useTransition } from "react";
import { addQuickReply, deleteQuickReply, updateQuickReply, addCategory, updateCategory, deleteCategory } from "./actions";
import { Trash2, Copy, Check, Search, Settings } from "lucide-react";

export function QuickRepliesView({ quickReplies, user, categories, rawCategories }: { quickReplies: any[], user: any, categories: string[], rawCategories: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Tümü");

    const filteredReplies = quickReplies.filter(reply => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = reply.title.toLowerCase().includes(query) || reply.content.toLowerCase().includes(query);
        
        if (activeCategory === "Tümü") return matchesSearch;
        return matchesSearch && (reply.category || "Diğer") === activeCategory;
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Yanıt arayın..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {user && <CategoriesManager user={user} rawCategories={rawCategories} />}
                    <QuickReplyForm user={user} categories={categories} />
                </div>
            </div>

            <div className="flex overflow-x-auto pb-4 mb-4 gap-2 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            activeCategory === category 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredReplies.map(reply => (
                    <EditableReplyCard key={reply.id} reply={reply} user={user} categories={categories} />
                ))}
            </div>

            {filteredReplies.length === 0 && (
                <div className="text-center py-12 rounded-xl border border-dashed border-slate-300 text-slate-500 mt-6">
                    {searchQuery || activeCategory !== "Tümü" 
                        ? "Aramanıza veya seçili kategoriye uygun yanıt bulunamadı." 
                        : "Kayıtlı hızlı yanıt bulunmuyor."}
                </div>
            )}
        </div>
    );
}

export function EditableReplyCard({ reply, user, categories }: { reply: any, user: any, categories: string[] }) {
    const [title, setTitle] = useState(reply.title);
    const [content, setContent] = useState(reply.content);
    const [category, setCategory] = useState(reply.category || "Diğer");
    const [isPending, startTransition] = useTransition();

    const handleCategoryChange = (val: string) => {
        if (!user) return;
        setCategory(val);
        startTransition(async () => {
            await updateQuickReply(reply.id, { category: val });
        });
    };

    const handleTitleBlur = (val: string) => {
        if (!user) return;
        const trimmed = val.trim();
        if (!trimmed || trimmed === reply.title) {
            setTitle(reply.title);
            return;
        }
        startTransition(async () => {
            await updateQuickReply(reply.id, { title: trimmed });
        });
    };

    const handleContentBlur = (val: string) => {
        if (!user) return;
        const trimmed = val.trim();
        if (!trimmed || trimmed === reply.content) {
            setContent(reply.content);
            return;
        }
        startTransition(async () => {
            await updateQuickReply(reply.id, { content: trimmed });
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col relative group transition-all hover:shadow-md">
            <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 rounded-t-xl font-medium text-slate-800 relative flex items-center pr-20">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={(e) => handleTitleBlur(e.target.value)}
                    readOnly={!user}
                    className={`bg-transparent outline-none w-full font-semibold transition-colors ${user ? 'hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-100 px-2 py-1 -ml-2 rounded' : 'cursor-default'}`}
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-slate-200 rounded-md shrink-0">
                    <CopyBtn text={content} />
                    {user && (
                        <>
                            <div className="w-px bg-slate-200"></div>
                            <DelBtn id={reply.id} user={user} />
                        </>
                    )}
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                    <select
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        disabled={!user}
                        className={`text-xs font-medium px-2 py-1 outline-none rounded w-full border ${user ? 'border-slate-200 hover:border-blue-300 focus:ring-1 focus:ring-blue-300' : 'border-transparent bg-transparent cursor-default appearance-none'} text-slate-500 bg-white`}
                    >
                        {categories.filter(c => c !== "Tümü").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={(e) => handleContentBlur(e.target.value)}
                    readOnly={!user}
                    rows={4}
                    className={`w-full text-sm text-slate-600 outline-none resize-y ${user ? 'hover:bg-slate-50 focus:bg-slate-50 focus:ring-2 focus:ring-blue-100 p-2 -m-2 rounded transition-colors mt-2' : 'bg-transparent cursor-default mt-2'}`}
                />
            </div>
        </div>
    );
}

function QuickReplyForm({ user, categories }: { user: any, categories: string[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            await addQuickReply({
                title: formData.get("title") as string,
                content: formData.get("content") as string,
                category: formData.get("category") as string || "Diğer",
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
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
                + Yeni Yanıt Ekle
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full max-w-lg absolute z-10 top-0 right-0">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select name="category" defaultValue="Diğer" className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-500">
                        {categories.filter(c => c !== "Tümü").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Yanıt İçeriği</label>
                    <textarea required name="content" rows={4} className="w-full border-slate-300 border rounded-lg px-3 py-2 text-slate-900 resize-none font-mono text-sm"></textarea>
                </div>
                <button type="submit" disabled={isPending} className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
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

export function DelBtn({ id, user }: { id: string, user?: any }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            onClick={() => {
                if (!user) {
                    alert("Bu işlemi gerçekleştirmek için sol alttaki menüden sisteme giriş yapmalısınız.");
                    return;
                }
                startTransition(() => deleteQuickReply(id));
            }}
            disabled={isPending}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Sil"
        >
            <Trash2 size={18} />
        </button>
    );
}

export function CategoriesManager({ user, rawCategories }: { user: any, rawCategories: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    if (!user) return null;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                title="Grupları Yönet"
            >
                <Settings size={18} />
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xl w-full max-w-md absolute z-20 top-0 right-0">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Grupları Yönet</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
                {rawCategories.map(cat => (
                    <CategoryEditRow key={cat.id} category={cat} isPending={isPending} startTransition={startTransition} />
                ))}
                {rawCategories.length === 0 && (
                    <p className="text-sm text-slate-500 italic text-center py-2">Kayıtlı grup bulunmuyor.</p>
                )}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const name = fd.get("name") as string;
                    if (name.trim()) {
                        startTransition(async () => {
                            await addCategory(name.trim());
                            (e.target as HTMLFormElement).reset();
                        });
                    }
                }}
                className="flex gap-2 pt-3 border-t border-slate-100"
            >
                <input required type="text" name="name" placeholder="Yeni Grup Ekle..." className="flex-1 border-slate-300 border rounded-lg px-3 py-2 text-sm text-slate-900" />
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">Ekle</button>
            </form>
        </div>
    );
}

function CategoryEditRow({ category, isPending, startTransition }: { category: any, isPending: boolean, startTransition: React.TransitionStartFunction }) {
    const [name, setName] = useState(category.name);

    return (
        <div className="flex items-center gap-2 group">
            <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                onBlur={() => {
                    if (name.trim() && name !== category.name) {
                        startTransition(async () => await updateCategory(category.id, name.trim()));
                    } else {
                        setName(category.name);
                    }
                }}
                className="flex-1 border border-transparent hover:border-slate-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-300 rounded px-2 py-1 outline-none text-sm font-medium transition-colors"
                disabled={isPending}
            />
            <button 
                onClick={() => {
                    if(confirm(`"${category.name}" grubunu silmek istediğinize emin misiniz? Bu gruptaki yanıtlar "Diğer" grubuna taşınacaktır.`)) {
                        startTransition(async () => await deleteCategory(category.id));
                    }
                }}
                disabled={isPending} 
                className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 rounded transition-all disabled:opacity-50"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
