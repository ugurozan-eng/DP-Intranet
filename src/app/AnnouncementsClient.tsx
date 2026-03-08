"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type Announcement = {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
};

export function AnnouncementsClient({ initialData }: { initialData: Announcement[] }) {
    const [search, setSearch] = useState("");

    const filtered = initialData.filter(item => {
        const q = search.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
    });

    return (
        <div className="flex flex-col flex-1 relative bg-slate-50">
            {/* Sticky Search Bar */}
            <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm pb-6 pt-4 border-b border-slate-200">
                <div className="relative max-w-2xl mx-auto w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
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
            <div className="py-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
                {filtered.map(item => (
                    <div key={item.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight pr-8">
                                {item.title}
                            </h2>
                            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap border border-blue-100">
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
