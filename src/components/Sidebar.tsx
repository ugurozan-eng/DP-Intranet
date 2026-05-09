"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
    Settings,
    FileText,
    Briefcase,
    Users,
    ClipboardList,
    Megaphone,
    MessageSquare,
    Menu,
    LogOut,
    LogIn,
    X,
    User as UserIcon,
    Search,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    Stethoscope,
    Sparkles
} from "lucide-react";
import { logout } from "@/app/login/actions";

const deptNavigation = [
    { name: 'Duyurular / Kampanyalar', href: '/', icon: Megaphone },
    { name: 'İşlemler / Fiyatlar', href: '/services', icon: Briefcase },
    { name: 'Bilgi / Satış Scriptleri', href: '/product-scripts', icon: MessageSquare },
    { name: 'Hızlı Yanıtlar', href: '/scripts', icon: FileText },
];

const globalNavigation = [
    { name: 'Masraf Formları', href: '/forms', icon: ClipboardList },
    { name: 'İzin Formları', href: '/leaves', icon: ClipboardList },
    { name: 'Çalışanlarımız', href: '/employees', icon: Users },
    { name: 'Sıkça Sorulan Sorular', href: '/faq', icon: HelpCircle },
];

export function Sidebar({ user }: { user: { email: string, role: string, allowedDepartments?: string[] } | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [openDepts, setOpenDepts] = useState<{ [key: string]: boolean }>({
        "KLINIK": true,
        "GUZELLIK": false
    });

    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentDept = searchParams.get('dept') || 'KLINIK';

    // Auto open the department if user is in it
    useEffect(() => {
        if (currentDept) {
            setOpenDepts(prev => ({ ...prev, [currentDept]: true }));
        }
    }, [currentDept]);

    if (pathname.startsWith('/login')) return null;

    const closeSidebar = () => setIsOpen(false);

    const toggleDept = (dept: string) => {
        setOpenDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
    };

    const isAllowed = (dept: string) => {
        if (!user) return false;
        if (user.email === 'ugurozan@gmail.com') return true;
        return user.allowedDepartments?.includes(dept);
    };

    return (
        <>
            {/* Mobile Top Header */}
            <div className="md:hidden flex h-16 items-center justify-between bg-slate-900 px-4 shrink-0 shadow-md relative z-30">
                <h1 className="font-bold text-white text-xl">DP İntranet</h1>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1 text-slate-300 hover:text-white transition-colors focus:outline-none"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar Drawer */}
            <div className={`
                fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-300 ease-in-out shadow-2xl
                md:relative md:translate-x-0 md:shadow-none
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="hidden auto md:flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
                    <h1 className="font-bold text-white text-xl">DP İntranet</h1>
                </div>

                <div className="flex flex-1 flex-col overflow-y-auto mt-4 md:mt-0">
                    <div className="px-4 py-4 md:pt-6 md:pb-2">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim().length > 1) {
                                router.push(`/search?q=${encodeURIComponent(searchQuery)}&dept=${currentDept}`);
                                closeSidebar();
                            }
                        }} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tüm uygulamada ara..."
                                className="w-full bg-slate-800 text-white placeholder-slate-400 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </form>
                    </div>

                    <nav className="flex-1 space-y-1 px-3 py-2">
                        {/* Department - Klinik */}
                        {isAllowed("KLINIK") && (
                            <div className="mb-2">
                                <button
                                    onClick={() => toggleDept("KLINIK")}
                                    className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-bold rounded-md transition-colors ${currentDept === 'KLINIK' ? 'text-blue-400' : 'text-slate-100 hover:bg-slate-800'}`}
                                >
                                    <div className="flex items-center">
                                        <Stethoscope className="mr-3 h-5 w-5 flex-shrink-0" />
                                        Klinik
                                    </div>
                                    {openDepts["KLINIK"] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                {openDepts["KLINIK"] && (
                                    <div className="mt-1 ml-4 space-y-1 border-l border-slate-800 pl-2">
                                        {deptNavigation.map((item) => {
                                            const href = `${item.href === '/' ? '' : item.href}?dept=KLINIK`;
                                            const isActive = pathname === item.href && currentDept === 'KLINIK';
                                            return (
                                                <Link
                                                    key={`KLINIK-${item.name}`}
                                                    href={href}
                                                    onClick={closeSidebar}
                                                    className={`group flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${isActive
                                                        ? "bg-slate-800 text-white"
                                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                                        }`}
                                                >
                                                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Department - Güzellik Merkezi */}
                        {isAllowed("GUZELLIK") && (
                            <div className="mb-2">
                                <button
                                    onClick={() => toggleDept("GUZELLIK")}
                                    className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-bold rounded-md transition-colors ${currentDept === 'GUZELLIK' ? 'text-pink-400' : 'text-slate-100 hover:bg-slate-800'}`}
                                >
                                    <div className="flex items-center">
                                        <Sparkles className="mr-3 h-5 w-5 flex-shrink-0" />
                                        Güzellik Merkezi
                                    </div>
                                    {openDepts["GUZELLIK"] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                {openDepts["GUZELLIK"] && (
                                    <div className="mt-1 ml-4 space-y-1 border-l border-slate-800 pl-2">
                                        {deptNavigation.map((item) => {
                                            const href = `${item.href === '/' ? '' : item.href}?dept=GUZELLIK`;
                                            const isActive = pathname === item.href && currentDept === 'GUZELLIK';
                                            return (
                                                <Link
                                                    key={`GUZELLIK-${item.name}`}
                                                    href={href}
                                                    onClick={closeSidebar}
                                                    className={`group flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${isActive
                                                        ? "bg-slate-800 text-white"
                                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                                        }`}
                                                >
                                                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="my-4 border-t border-slate-800 pt-4"></div>

                        {/* Global Navigation */}
                        {globalNavigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={closeSidebar}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                                            }`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}

                        {user?.role === 'ADMIN' && (
                            <Link
                                href="/settings"
                                onClick={closeSidebar}
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/settings'
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                    }`}
                            >
                                <Settings className="mr-3 h-5 w-5 flex-shrink-0 transition-colors text-slate-400 group-hover:text-white" />
                                Settings
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="shrink-0 p-4 border-t border-slate-800">
                    {user ? (
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                                    <UserIcon size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white truncate w-32">{user.email}</span>
                                    <span className="text-xs text-slate-500 font-semibold">{user.role}</span>
                                </div>
                            </div>
                            <form action={logout}>
                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
                                    <LogOut size={16} />
                                    Çıkış Yap
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login" onClick={closeSidebar}>
                            <div className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                <LogIn size={16} />
                                Giriş Yap
                            </div>
                        </Link>
                    )}
                </div>

            </div>
        </>
    );
}

