"use client";

import { useState } from "react";
import { 
    BarChart3, 
    Copy, 
    Eye, 
    TrendingUp, 
    Flame, 
    FileText, 
    Briefcase, 
    Megaphone, 
    HelpCircle, 
    Users, 
    ClipboardList, 
    Building2,
    Calendar,
    Sparkles,
    UserCheck,
    Clock
} from "lucide-react";

interface PageViewItem {
    id: string;
    path: string;
    department: string;
    count: number;
    updatedAt: string;
}

interface QuickReplyItem {
    id: string;
    title: string;
    topic: string | null;
    category: string;
    department: string;
    copyCount: number;
}

interface UserActivityItem {
    id: string;
    userEmail: string;
    pageViews: number;
    copies: number;
    department: string;
    updatedAt: string;
}

const PAGE_NAMES: { [key: string]: { name: string, icon: any } } = {
    "/": { name: "Duyurular / Kampanyalar", icon: Megaphone },
    "/scripts": { name: "Hızlı Yanıtlar", icon: FileText },
    "/services": { name: "İşlemler / Fiyatlar", icon: Briefcase },
    "/product-scripts": { name: "Bilgi / Satış Scriptleri", icon: FileText },
    "/forms": { name: "Masraf Formları", icon: ClipboardList },
    "/leaves": { name: "İzin Formları", icon: Calendar },
    "/employees": { name: "Çalışanlarımız", icon: Users },
    "/faq": { name: "Sıkça Sorulan Sorular", icon: HelpCircle },
    "/settings": { name: "Ayarlar", icon: Building2 },
    "/reports": { name: "Raporlar & Kullanım", icon: BarChart3 },
};

export function ReportsView({ 
    pageViews, 
    quickReplies,
    userActivities = []
}: { 
    pageViews: PageViewItem[], 
    quickReplies: QuickReplyItem[],
    userActivities?: UserActivityItem[]
}) {
    const [selectedDept, setSelectedDept] = useState<string>("TÜMÜ");

    // Filter by department
    const filteredViews = pageViews.filter(pv => {
        if (selectedDept === "TÜMÜ") return true;
        return pv.department === selectedDept;
    });

    const filteredReplies = quickReplies.filter(qr => {
        if (selectedDept === "TÜMÜ") return true;
        return qr.department === selectedDept;
    });

    const filteredUsers = userActivities.filter(ua => {
        if (selectedDept === "TÜMÜ") return true;
        return ua.department === selectedDept;
    });

    // Aggregate user activities by userEmail across departments if "TÜMÜ" is selected
    const userAggregates: { [email: string]: { email: string, pageViews: number, copies: number, department: string, lastActive: string } } = {};
    filteredUsers.forEach(ua => {
        if (!userAggregates[ua.userEmail]) {
            userAggregates[ua.userEmail] = {
                email: ua.userEmail,
                pageViews: 0,
                copies: 0,
                department: ua.department,
                lastActive: ua.updatedAt
            };
        }
        userAggregates[ua.userEmail].pageViews += ua.pageViews;
        userAggregates[ua.userEmail].copies += ua.copies;
        if (new Date(ua.updatedAt) > new Date(userAggregates[ua.userEmail].lastActive)) {
            userAggregates[ua.userEmail].lastActive = ua.updatedAt;
        }
    });

    const sortedUsers = Object.values(userAggregates)
        .sort((a, b) => (b.copies * 2 + b.pageViews) - (a.copies * 2 + a.pageViews));

    // Aggregate page views by path for selected department
    const pathAggregates: { [path: string]: number } = {};
    filteredViews.forEach(pv => {
        pathAggregates[pv.path] = (pathAggregates[pv.path] || 0) + pv.count;
    });

    const sortedPages = Object.entries(pathAggregates)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count);

    const totalViews = sortedPages.reduce((sum, p) => sum + p.count, 0);
    const totalCopies = filteredReplies.reduce((sum, r) => sum + (r.copyCount || 0), 0);
    const topPage = sortedPages.length > 0 ? (PAGE_NAMES[sortedPages[0].path]?.name || sortedPages[0].path) : "-";
    const topUser = sortedUsers.length > 0 ? sortedUsers[0].email : "-";

    return (
        <div className="space-y-8">
            {/* Header & Department Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <BarChart3 className="text-blue-600" size={30} />
                        Kullanım & Personel Raporu
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Sistemde ziyaret edilen sayfaların, kopyalanan hazır yanıtların ve personellerin canlı kullanım adetleri.
                    </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
                    {["TÜMÜ", "KLINIK", "GUZELLIK", "DENTAL"].map(dept => (
                        <button
                            key={dept}
                            onClick={() => setSelectedDept(dept)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                selectedDept === dept
                                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                            }`}
                        >
                            {dept === "TÜMÜ" ? "Tüm Departmanlar" : (dept === "GUZELLIK" ? "Güzellik" : (dept === "DENTAL" ? "Dental" : "Klinik"))}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam Sayfa Ziyareti</span>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalViews.toLocaleString("tr-TR")}</h3>
                        <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
                            <TrendingUp size={12} /> Canlı Sayaç
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Eye size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam Kopyalanan Mesaj</span>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCopies.toLocaleString("tr-TR")}</h3>
                        <span className="text-[11px] text-amber-600 font-medium mt-1 inline-flex items-center gap-1">
                            <Flame size={12} /> Temsilci Kullanımı
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Copy size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">En Çok Girilen Sayfa</span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 truncate max-w-[170px]" title={topPage}>{topPage}</h3>
                        <span className="text-[11px] text-slate-400 mt-1 block">En popüler sayfa</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Sparkles size={22} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">En Aktif Personel</span>
                        <h3 className="text-base font-bold text-slate-900 mt-1 truncate max-w-[170px]" title={topUser}>{topUser}</h3>
                        <span className="text-[11px] text-slate-400 mt-1 block">En çok işlem yapan</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <UserCheck size={22} />
                    </div>
                </div>
            </div>

            {/* Personel & Kullanıcı Bazlı Aktivite Tablosu */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Users size={18} className="text-purple-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Personel & Kullanıcı Kullanım Dağılımı</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{sortedUsers.length} Kullanıcı Kayıtlı</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Sıra & Personel</th>
                                <th className="px-6 py-3">Departman</th>
                                <th className="px-6 py-3 text-center">Sayfa Ziyareti</th>
                                <th className="px-6 py-3 text-center">Kopyalanan Mesaj</th>
                                <th className="px-6 py-3 text-center">Toplam Aktivite</th>
                                <th className="px-6 py-3 text-right">Son İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedUsers.map((u, idx) => (
                                <tr key={u.email} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-3.5 flex items-center gap-3">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                            idx === 0 ? "bg-amber-100 text-amber-800" :
                                            idx === 1 ? "bg-slate-200 text-slate-700" :
                                            idx === 2 ? "bg-amber-50 text-amber-700" : "text-slate-400"
                                        }`}>
                                            {idx + 1}
                                        </span>
                                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                                            {u.email.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-slate-900 truncate max-w-[220px]" title={u.email}>
                                            {u.email}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                                            {u.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-700">
                                        {u.pageViews}
                                    </td>
                                    <td className="px-6 py-3.5 text-center font-mono font-bold text-amber-600">
                                        🔥 {u.copies}
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                                            {u.pageViews + u.copies} işlem
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right text-slate-400 text-[11px] font-mono">
                                        <div className="flex items-center justify-end gap-1">
                                            <Clock size={11} />
                                            <span>{new Date(u.lastActive).toLocaleDateString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {sortedUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-400">
                                        Henüz personel kullanım kaydı bulunmuyor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Main Content Grid: Page Views vs Copy Counts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Table: Page Views */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Eye size={18} className="text-blue-600" />
                            <h3 className="font-bold text-slate-900 text-sm">Sayfa Kullanım Adetleri</h3>
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">{sortedPages.length} Sayfa Kayıtlı</span>
                    </div>

                    <div className="p-6 divide-y divide-slate-100 flex-1">
                        {sortedPages.map((item) => {
                            const info = PAGE_NAMES[item.path] || { name: item.path, icon: FileText };
                            const IconComponent = info.icon;
                            const percentage = totalViews > 0 ? Math.round((item.count / totalViews) * 100) : 0;

                            return (
                                <div key={item.path} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                            <IconComponent size={16} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-xs text-slate-900 truncate">{info.name}</span>
                                                <span className="font-mono text-xs font-bold text-slate-700">{item.count} ziyaret ({percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                                                    style={{ width: `${Math.max(percentage, 3)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {sortedPages.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-10">Henüz sayfa ziyaret kaydı bulunmuyor.</p>
                        )}
                    </div>
                </div>

                {/* Right Table: Copy Counts */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Copy size={18} className="text-amber-600" />
                            <h3 className="font-bold text-slate-900 text-sm">En Çok Kopyalanan Hızlı Yanıtlar</h3>
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">{filteredReplies.length} Yanıt</span>
                    </div>

                    <div className="p-6 divide-y divide-slate-100 flex-1 max-h-[550px] overflow-y-auto">
                        {filteredReplies.map((reply, idx) => (
                            <div key={reply.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        idx === 0 ? "bg-amber-100 text-amber-800" :
                                        idx === 1 ? "bg-slate-200 text-slate-700" :
                                        idx === 2 ? "bg-amber-50 text-amber-700" : "text-slate-400"
                                    }`}>
                                        {idx + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-xs text-slate-900 truncate">{reply.title}</div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                            <span>{reply.category}</span>
                                            {reply.topic && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-blue-600 font-medium">{reply.topic}</span>
                                                </>
                                            )}
                                            <span>•</span>
                                            <span className="font-semibold text-slate-500">{reply.department}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 shrink-0 font-bold text-xs">
                                    <Flame size={12} className="fill-amber-500 text-amber-500" />
                                    <span>{reply.copyCount || 0}</span>
                                </div>
                            </div>
                        ))}

                        {filteredReplies.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-10">Henüz kopyalama verisi bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
