"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Search, Loader2, ChevronRight, FileText, User as UserIcon, Megaphone, Briefcase, MessageSquare } from 'lucide-react';

type SearchResult = {
    id: string;
    title: string;
    description: string;
    url: string;
    type: string;
};

function getIconForType(type: string) {
    switch (type) {
        case 'Duyuru / Kampanya': return <Megaphone className="text-orange-500" size={20} />;
        case 'İşlem / Fiyat': return <Briefcase className="text-blue-500" size={20} />;
        case 'Bilgi / Satış Scripti': return <MessageSquare className="text-purple-500" size={20} />;
        case 'Hızlı Yanıt': return <FileText className="text-emerald-500" size={20} />;
        case 'Çalışan': return <UserIcon className="text-pink-500" size={20} />;
        default: return <FileText className="text-slate-500" size={20} />;
    }
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                setResults(data.results || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Search error", err);
                setResults([]);
                setLoading(false);
            });
    }, [query]);

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Search className="text-blue-600" size={28} />
                    Arama Sonuçları
                </h1>
                {query ? (
                    <p className="text-slate-500 mt-2 text-lg">
                        "<span className="font-semibold text-slate-700">{query}</span>" için sonuçlar gösteriliyor
                    </p>
                ) : (
                    <p className="text-slate-500 mt-2 text-lg">
                        Arama yapmak için sol menüdeki arama çubuğunu kullanın.
                    </p>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                    <p>Sonuçlar aranıyor...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {query && results.length === 0 && (
                        <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
                            Aradığınız kelimeye uygun bir sonuç bulunamadı. Lütfen başka bir kelime ile tekrar deneyin.
                        </div>
                    )}

                    {results.map((result) => (
                        <Link href={result.url} key={result.id} className="block group">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-start justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:bg-blue-50 transition-colors">
                                        {getIconForType(result.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                                {result.type}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                            {result.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-1 line-clamp-2 leading-relaxed">
                                            {result.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 self-center text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 w-full">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                <p>Sayfa yükleniyor...</p>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
