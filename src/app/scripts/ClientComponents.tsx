"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { addQuickReply, deleteQuickReply, updateQuickReply, addCategory, updateCategory, deleteCategory, updateCategoryOrders, updateQuickReplyOrders } from "./actions";
import { Trash2, Copy, Check, Search, Settings, ChevronUp, ChevronDown, GripVertical, Archive, ArchiveRestore, Star, Tag } from "lucide-react";

export function QuickRepliesView({ quickReplies, user, categories, rawCategories, department }: { quickReplies: any[], user: any, categories: string[], rawCategories: any[], department: string }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(() => {
        if (department === 'KLINIK') {
            const item = categories.find(c => c.toLowerCase() === "botoks");
            if (item) return item;
        }
        const item = categories.find(c => c.toLowerCase() === "işlemler");
        if (item) return item;
        return categories.length > 0 ? categories[0] : "Tümü";
    });

    const categoriesWithArchive = [...categories, "Arşiv"];

    const [localReplies, setLocalReplies] = useState(quickReplies);
    const [localCategories, setLocalCategories] = useState(rawCategories);
    const [draggedItem, setDraggedItem] = useState<any>(null);
    const [dragOverItem, setDragOverItem] = useState<any>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setLocalReplies(quickReplies);
    }, [quickReplies]);

    useEffect(() => {
        setLocalCategories(rawCategories);
    }, [rawCategories]);

    useEffect(() => {
        if (department === 'KLINIK') {
            setActiveCategory("Botoks");
        } else {
            setActiveCategory(categories.length > 0 ? categories[0] : "Tümü");
        }
    }, [department]);

    const filteredReplies = localReplies.filter(reply => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = reply.title.toLowerCase().includes(query) || 
                             reply.content.toLowerCase().includes(query) ||
                             (reply.topic && reply.topic.toLowerCase().includes(query));
        
        if (activeCategory === "Arşiv") {
            return matchesSearch && reply.isArchived;
        }

        // Only show non-archived items in regular categories, Kampanyalar, and Tümü
        if (reply.isArchived) return false;

        if (activeCategory === "Kampanyalar") {
            return matchesSearch && (
                reply.category === "Kampanyalar" ||
                reply.topic === "Kampanya" ||
                reply.title.toLowerCase().includes("kampanya") ||
                reply.content.toLowerCase().includes("kampanya") ||
                reply.title.toLowerCase().includes("kmp") ||
                reply.content.toLowerCase().includes("kmp")
            );
        }

        if (activeCategory === "Tümü") return matchesSearch;
        return matchesSearch && (reply.category || "Diğer") === activeCategory;
    });

    const handleSidebarMove = (index: number, direction: 'up' | 'down') => {
        if (!user) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === localCategories.length - 1) return;

        const newOrder = [...localCategories];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newOrder[index];
        newOrder[index] = newOrder[swapIndex];
        newOrder[swapIndex] = temp;

        setLocalCategories(newOrder);

        const updates = newOrder.map((cat, i) => ({ id: cat.id, order: i }));
        startTransition(async () => {
            await updateCategoryOrders(updates);
        });
    };

    const handleDragStart = (e: React.DragEvent, reply: any) => {
        if (!user) {
            e.preventDefault();
            return;
        }
        setDraggedItem(reply);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, reply: any) => {
        e.preventDefault();
        if (!user || !draggedItem || draggedItem.id === reply.id) return;
        setDragOverItem(reply);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDrop = (e: React.DragEvent, targetReply: any) => {
        e.preventDefault();
        if (!user || !draggedItem || draggedItem.id === targetReply.id) {
            handleDragEnd();
            return;
        }

        const newLocal = [...localReplies];
        const draggedIdx = newLocal.findIndex(r => r.id === draggedItem.id);
        const targetIdx = newLocal.findIndex(r => r.id === targetReply.id);

        if (draggedIdx === -1 || targetIdx === -1) {
            handleDragEnd();
            return;
        }

        const [movedItem] = newLocal.splice(draggedIdx, 1);
        newLocal.splice(targetIdx, 0, movedItem);

        setLocalReplies(newLocal);
        handleDragEnd();

        const updates = newLocal.map((r, i) => ({ id: r.id, order: i }));
        startTransition(() => {
            updateQuickReplyOrders(updates);
        });
    };

    // Render Klinik Service-Driven 2-Column Layout
    if (department === 'KLINIK') {
        const campaignCount = localReplies.filter(r => !r.isArchived && (
            r.category === "Kampanyalar" ||
            r.topic === "Kampanya" ||
            r.title.toLowerCase().includes("kampanya") ||
            r.content.toLowerCase().includes("kampanya") ||
            r.title.toLowerCase().includes("kmp") ||
            r.content.toLowerCase().includes("kmp")
        )).length;

        return (
            <div className="flex flex-col md:flex-row gap-5">
                {/* Left Services Navigation Column */}
                <div className="w-full md:w-60 shrink-0 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm self-start space-y-3">
                    <div className="flex items-center justify-between px-1.5 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Tag size={15} className="text-blue-600" />
                            <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase">Hizmetler</h3>
                        </div>
                        {user && <CategoriesManager user={user} rawCategories={localCategories} department={department} />}
                    </div>

                    {/* Highlighted Kampanyalar Button */}
                    <button
                        onClick={() => setActiveCategory("Kampanyalar")}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 ${
                            activeCategory === "Kampanyalar"
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white ring-2 ring-amber-300 shadow-md shadow-amber-500/20 scale-[1.01]"
                            : "bg-gradient-to-r from-amber-50 to-amber-100/60 text-amber-900 border border-amber-200/80 hover:bg-amber-100/80 hover:translate-x-0.5 active:scale-[0.98]"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Star size={15} className={activeCategory === "Kampanyalar" ? "fill-white text-white" : "fill-amber-500 text-amber-500"} />
                            <span>Kampanyalar</span>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                            activeCategory === "Kampanyalar" ? "bg-white/25 text-white" : "bg-amber-200/70 text-amber-900"
                        }`}>
                            {campaignCount}
                        </span>
                    </button>

                    {/* Extended Services List with In-Sidebar Reordering */}
                    <div className="space-y-1 max-h-[calc(100vh-230px)] min-h-[500px] overflow-y-auto pr-1">
                        {localCategories.filter(cat => cat.name !== "Kampanyalar").map((cat, index) => {
                            const count = localReplies.filter(r => !r.isArchived && (r.category || "Diğer") === cat.name).length;
                            const isActive = activeCategory === cat.name;

                            return (
                                <div key={cat.id} className="group/item relative flex items-center">
                                    <button
                                        onClick={() => setActiveCategory(cat.name)}
                                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 ${
                                            isActive
                                            ? "bg-slate-900 text-white font-bold shadow-sm shadow-slate-900/20 translate-x-1"
                                            : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-0.5 active:scale-[0.98]"
                                        } ${user ? "pr-12" : ""}`}
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        <span className={`text-[11px] px-1.5 py-0.2 rounded-md font-bold shrink-0 ${
                                            isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
                                        }`}>
                                            {count}
                                        </span>
                                    </button>

                                    {/* Quick Reorder Arrows directly in sidebar */}
                                    {user && (
                                        <div className="absolute right-1 flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs rounded-md shadow-xs border border-slate-200/70 p-0.5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSidebarMove(index, 'up');
                                                }}
                                                disabled={index === 0 || isPending}
                                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded"
                                                title="Yukarı Taşı"
                                            >
                                                <ChevronUp size={13} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSidebarMove(index, 'down');
                                                }}
                                                disabled={index === localCategories.length - 1 || isPending}
                                                className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 hover:bg-slate-100 rounded"
                                                title="Aşağı Taşı"
                                            >
                                                <ChevronDown size={13} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* System Views: Tümü & Arşiv */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-1">
                        <button
                            onClick={() => setActiveCategory("Tümü")}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                activeCategory === "Tümü"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            }`}
                        >
                            <span>Tüm Hizmetler</span>
                            <span className="text-[11px] font-bold">{localReplies.filter(r => !r.isArchived).length}</span>
                        </button>

                        <button
                            onClick={() => setActiveCategory("Arşiv")}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                activeCategory === "Arşiv"
                                ? "bg-amber-600 text-white shadow-sm"
                                : "text-slate-500 hover:bg-slate-100 hover:text-amber-700"
                            }`}
                        >
                            <span>Arşivdeki Yanıtlar</span>
                            <span className="text-[11px] font-bold">{localReplies.filter(r => r.isArchived).length}</span>
                        </button>
                    </div>
                </div>

                {/* Right Cards Area (4 Columns Grid & Compact Height) */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 mb-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder={`${activeCategory} içinde arayın...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-xs text-sm"
                            />
                        </div>
                        <QuickReplyForm 
                            user={user} 
                            categories={categories} 
                            department={department} 
                            defaultCategory={activeCategory !== "Tümü" && activeCategory !== "Arşiv" && activeCategory !== "Kampanyalar" ? activeCategory : "Botoks"} 
                        />
                    </div>

                    {/* 4 Columns Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3.5">
                        {filteredReplies.map(reply => (
                            <div
                                key={reply.id}
                                draggable={!!user}
                                onDragStart={(e) => handleDragStart(e, reply)}
                                onDragOver={(e) => handleDragOver(e, reply)}
                                onDrop={(e) => handleDrop(e, reply)}
                                onDragEnd={handleDragEnd}
                                className={`transition-all duration-200 ${dragOverItem?.id === reply.id ? 'opacity-80 scale-[1.02] ring-2 ring-blue-400 rounded-xl' : 'opacity-100'} ${draggedItem?.id === reply.id ? 'opacity-40' : ''}`}
                            >
                                <EditableReplyCard reply={reply} user={user} categories={categories} department={department} />
                            </div>
                        ))}
                    </div>

                    {filteredReplies.length === 0 && (
                        <div className="text-center py-14 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-500 mt-4">
                            <p className="font-semibold text-slate-700 text-sm">Bu bölümde henüz yanıt bulunmuyor.</p>
                            <p className="text-xs text-slate-400 mt-1">Yukarıdaki "+ Yeni Yanıt Ekle" butonunu kullanarak bu hizmete yanıt ekleyebilirsiniz.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default Layout for GUZELLIK and DENTAL
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
                    {user && <CategoriesManager user={user} rawCategories={rawCategories} department={department} />}
                    <QuickReplyForm user={user} categories={categories} department={department} />
                </div>
            </div>

            <div className="flex flex-wrap pb-4 mb-4 gap-2">
                {categoriesWithArchive.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            activeCategory === category 
                            ? (category === "Arşiv" ? 'bg-amber-600 text-white shadow-sm' : (department === 'GUZELLIK' ? 'bg-pink-600 text-white shadow-sm' : (department === 'DENTAL' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-900 text-white shadow-sm')))
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredReplies.map(reply => (
                    <div
                        key={reply.id}
                        draggable={!!user}
                        onDragStart={(e) => handleDragStart(e, reply)}
                        onDragOver={(e) => handleDragOver(e, reply)}
                        onDrop={(e) => handleDrop(e, reply)}
                        onDragEnd={handleDragEnd}
                        className={`transition-all duration-200 ${dragOverItem?.id === reply.id ? 'opacity-80 scale-[1.02] ring-2 ring-blue-400 rounded-xl' : 'opacity-100'} ${draggedItem?.id === reply.id ? 'opacity-40' : ''}`}
                    >
                        <EditableReplyCard reply={reply} user={user} categories={categories} department={department} />
                    </div>
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

export function EditableReplyCard({ reply, user, categories, department }: { reply: any, user: any, categories: string[], department?: string }) {
    const [title, setTitle] = useState(reply.title);
    const [topic, setTopic] = useState(reply.topic || "İşlem Detayı");
    const [content, setContent] = useState(reply.content);
    const [category, setCategory] = useState(reply.category || "Diğer");
    const [isPending, startTransition] = useTransition();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const savedHeight = localStorage.getItem(`textarea-height-${reply.id}`);
        if (savedHeight && textareaRef.current) {
            textareaRef.current.style.height = savedHeight;
        }

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === textareaRef.current) {
                    const inlineHeight = (entry.target as HTMLElement).style.height;
                    if (inlineHeight) {
                        localStorage.setItem(`textarea-height-${reply.id}`, inlineHeight);
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
    }, [reply.id]);

    const handleCategoryChange = (val: string) => {
        if (!user) return;
        setCategory(val);
        startTransition(async () => {
            await updateQuickReply(reply.id, { category: val }, reply.department || department);
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
            await updateQuickReply(reply.id, { title: trimmed }, reply.department || department);
        });
    };

    const handleTopicBlur = (val: string) => {
        if (!user) return;
        const trimmed = val.trim();
        if (!trimmed || trimmed === (reply.topic || "İşlem Detayı")) {
            setTopic(reply.topic || "İşlem Detayı");
            return;
        }
        startTransition(async () => {
            await updateQuickReply(reply.id, { topic: trimmed }, reply.department || department);
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
            await updateQuickReply(reply.id, { content: trimmed }, reply.department || department);
        });
    };

    return (
        <div className={`bg-white rounded-xl shadow-xs border border-slate-200/90 flex flex-col relative group transition-all duration-150 hover:shadow-md hover:border-slate-300 ${user ? 'cursor-grab active:cursor-grabbing' : ''} h-full overflow-hidden`}>
            {/* Card Top Header */}
            <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/75 rounded-t-xl font-medium text-slate-800 relative flex flex-col gap-0.5 pr-16">
                <div className="flex items-center">
                    {user && <GripVertical size={13} className="text-slate-300 mr-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={(e) => handleTitleBlur(e.target.value)}
                        readOnly={!user}
                        className={`bg-transparent outline-none w-full font-bold text-slate-900 text-xs transition-colors ${user ? 'hover:bg-white focus:bg-white focus:ring-1 focus:ring-blue-100 px-1 py-0.5 -ml-1 rounded cursor-text' : 'cursor-default'}`}
                    />
                </div>

                {/* Subcategory / Topic Header */}
                <div className="flex items-center text-[11px] font-semibold text-blue-600 pl-0.5">
                    <span className="text-[9px] text-slate-400 mr-1 font-mono uppercase tracking-wider">Konu:</span>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onBlur={(e) => handleTopicBlur(e.target.value)}
                        readOnly={!user}
                        placeholder="Örn: Kalıcılık / Fiyat"
                        className={`bg-transparent outline-none font-semibold text-blue-700 transition-colors text-[11px] ${user ? 'hover:bg-white focus:bg-white focus:ring-1 focus:ring-blue-200 px-1 rounded cursor-text' : 'cursor-default'}`}
                    />
                </div>

                {/* Action buttons (Copy, Archive, Delete) */}
                <div className="absolute top-2.5 right-2.5 flex opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-xs border border-slate-200 rounded-lg shrink-0 overflow-hidden">
                    <CopyBtn text={content} />
                    {user && (
                        <>
                            <div className="w-px bg-slate-200"></div>
                            <ArchiveBtn id={reply.id} isArchived={reply.isArchived} user={user} department={reply.department || department} />
                            <div className="w-px bg-slate-200"></div>
                            <DelBtn id={reply.id} user={user} department={reply.department || department} />
                        </>
                    )}
                </div>
            </div>

            {/* Card Body (Adjusted to ~6cm / 225px height) */}
            <div className="p-3.5 flex-1 flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hizmet:</span>
                    <select
                        value={categories.includes(category) ? category : ""}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        disabled={!user}
                        className={`text-[11px] font-medium px-2 py-0.5 outline-none rounded-md border ${user ? 'border-slate-200 hover:border-blue-300 focus:ring-1 focus:ring-blue-300' : 'border-transparent bg-transparent cursor-default appearance-none'} text-slate-700 bg-slate-50`}
                    >
                        <option value="" disabled>Hizmet Seçiniz</option>
                        {categories.filter(c => c !== "Tümü").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={(e) => handleContentBlur(e.target.value)}
                    readOnly={!user}
                    rows={4}
                    className={`w-full text-xs text-slate-600 outline-none resize-y min-h-[110px] max-h-[220px] leading-relaxed ${user ? 'hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-blue-100 p-1.5 -m-1 rounded-lg transition-colors mt-1' : 'bg-transparent cursor-default mt-1'}`}
                />
            </div>
        </div>
    );
}

function QuickReplyForm({ user, categories, department, defaultCategory }: { user: any, categories: string[], department: string, defaultCategory?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            await addQuickReply({
                title: formData.get("title") as string,
                topic: (formData.get("topic") as string) || "İşlem Detayı",
                content: formData.get("content") as string,
                category: formData.get("category") as string,
                department
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
                className={`px-3.5 py-2 ${department === 'GUZELLIK' ? 'bg-pink-600 hover:bg-pink-700' : (department === 'DENTAL' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700')} text-white font-medium text-xs rounded-xl transition-colors whitespace-nowrap shadow-xs`}
            >
                + Yeni Yanıt Ekle
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Yeni Yanıt Ekle ({department === 'GUZELLIK' ? 'Güzellik' : (department === 'DENTAL' ? 'Dental' : 'Klinik')})</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Yanıt Başlığı</label>
                    <input required name="title" type="text" placeholder="Örn: Botoks Kalıcılık Süresi" className="w-full border-slate-300 border rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kart Konusu / Alt Başlık</label>
                    <input required name="topic" type="text" defaultValue="İşlem Detayı" placeholder="Örn: Kalıcılık Süresi, Fiyat Bilgisi" className="w-full border-slate-300 border rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hizmet Kategorisi</label>
                    <select name="category" defaultValue={defaultCategory || categories[0]} className="w-full border-slate-300 border rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                        {categories.filter(c => c !== "Tümü" && c !== "Kampanyalar").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Yanıt İçeriği</label>
                    <textarea required name="content" rows={4} className="w-full border-slate-300 border rounded-xl px-3 py-2 text-slate-900 resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                </div>
                <button type="submit" disabled={isPending} className={`w-full py-3 ${department === 'GUZELLIK' ? 'bg-pink-600 hover:bg-pink-700' : (department === 'DENTAL' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700')} text-white font-semibold rounded-xl transition-colors disabled:opacity-50`}>
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
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
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Kopyala"
        >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
    );
}

export function DelBtn({ id, user, department }: { id: string, user?: any, department: string }) {
    const [isPending, startTransition] = useTransition();
    return (
        <button
            onClick={() => {
                if (!user) {
                    alert("Bu işlemi gerçekleştirmek için sol alttaki menüden sisteme giriş yapmalısınız.");
                    return;
                }
                if (confirm("Bu yanıtı silmek istediğinize emin misiniz?")) {
                    startTransition(() => deleteQuickReply(id, department));
                }
            }}
            disabled={isPending}
            className="p-1.5 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Sil"
        >
            <Trash2 size={14} />
        </button>
    );
}

export function ArchiveBtn({ id, isArchived, user, department }: { id: string, isArchived: boolean, user?: any, department: string }) {
    const [isPending, startTransition] = useTransition();
    
    const handleArchiveToggle = () => {
        if (!user) {
            alert("Bu işlemi gerçekleştirmek için sol alttaki menüden sisteme giriş yapmalısınız.");
            return;
        }

        const confirmMessage = isArchived 
            ? "Bu yanıtı arşivden çıkarıp tekrar aktif yapmak istediğinize emin misiniz?" 
            : "Bu yanıtı arşivlemek istediğinize emin misiniz?";

        if (window.confirm(confirmMessage)) {
            startTransition(async () => {
                await updateQuickReply(id, { isArchived: !isArchived }, department);
            });
        }
    };

    return (
        <button
            onClick={handleArchiveToggle}
            disabled={isPending}
            className={`p-1.5 transition-colors disabled:opacity-50 ${isArchived ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'}`}
            title={isArchived ? "Geri Al / Arşivden Çıkar" : "Arşivle"}
        >
            {isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
        </button>
    );
}

export function CategoriesManager({ user, rawCategories, department, title }: { user: any, rawCategories: any[], department: string, title?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === rawCategories.length - 1) return;

        const newOrder = [...rawCategories];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newOrder[index];
        newOrder[index] = newOrder[swapIndex];
        newOrder[swapIndex] = temp;

        const updates = newOrder.map((cat, i) => ({ id: cat.id, order: i }));
        
        startTransition(async () => {
            await updateCategoryOrders(updates);
        });
    };

    if (!user) return null;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title={title || "Hizmetleri Yönet"}
            >
                <Settings size={15} />
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Hizmetleri Yönet ({department === 'GUZELLIK' ? 'Güzellik' : (department === 'DENTAL' ? 'Dental' : 'Klinik')})</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            
            <div className="space-y-2.5 max-h-72 overflow-y-auto mb-4 pr-2">
                {rawCategories.map((cat, index) => (
                    <CategoryEditRow 
                        key={cat.id} 
                        category={cat} 
                        isPending={isPending} 
                        startTransition={startTransition} 
                        onMoveUp={() => handleMove(index, 'up')}
                        onMoveDown={() => handleMove(index, 'down')}
                        canMoveUp={index > 0}
                        canMoveDown={index < rawCategories.length - 1}
                        department={department}
                    />
                ))}
                {rawCategories.length === 0 && (
                    <p className="text-sm text-slate-500 italic text-center py-2">Kayıtlı hizmet bulunmuyor.</p>
                )}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const name = fd.get("name") as string;
                    if (name.trim()) {
                        startTransition(async () => {
                            await addCategory(name.trim(), department);
                            (e.target as HTMLFormElement).reset();
                        });
                    }
                }}
                className="flex gap-2 pt-3 border-t border-slate-100"
            >
                <input required type="text" name="name" placeholder="Yeni Hizmet Ekle..." className="flex-1 border-slate-300 border rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <button type="submit" disabled={isPending} className={`px-4 py-2 ${department === 'GUZELLIK' ? 'bg-pink-600 hover:bg-pink-700' : (department === 'DENTAL' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-900 hover:bg-slate-800')} text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50`}>Ekle</button>
            </form>
        </div>
    );
}

function CategoryEditRow({ category, isPending, startTransition, onMoveUp, onMoveDown, canMoveUp, canMoveDown, department }: { category: any, isPending: boolean, startTransition: React.TransitionStartFunction, onMoveUp: () => void, onMoveDown: () => void, canMoveUp: boolean, canMoveDown: boolean, department: string }) {
    const [name, setName] = useState(category.name);

    return (
        <div className="flex items-center gap-2 group">
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity pr-1 w-5 items-center justify-center">
                <button onClick={onMoveUp} disabled={!canMoveUp || isPending} className="text-slate-400 hover:text-slate-700 disabled:opacity-0 p-0.5"><ChevronUp size={16} /></button>
                <button onClick={onMoveDown} disabled={!canMoveDown || isPending} className="text-slate-400 hover:text-slate-700 disabled:opacity-0 p-0.5"><ChevronDown size={16} /></button>
            </div>
            <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                onBlur={() => {
                    if (name.trim() && name !== category.name) {
                        startTransition(async () => await updateCategory(category.id, name.trim(), department));
                    } else {
                        setName(category.name);
                    }
                }}
                className="flex-1 border border-transparent hover:border-slate-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-300 rounded-lg px-2 py-1 outline-none text-sm font-medium transition-colors"
                disabled={isPending}
            />
            <button 
                onClick={() => {
                    if(confirm(`"${category.name}" hizmetini silmek istediğinize emin misiniz? Bu gruptaki yanıtlar "Diğer" grubuna taşınacaktır.`)) {
                        startTransition(async () => await deleteCategory(category.id, department));
                    }
                }}
                disabled={isPending} 
                className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all disabled:opacity-50"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
