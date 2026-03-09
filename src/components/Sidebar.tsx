"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Settings,
    FileText,
    Briefcase,
    Users,
    ClipboardList,
    Megaphone,
    MessageSquare,
    Menu,
    X
} from "lucide-react";

const navigation = [
    { name: 'Duyurular / Kampanyalar', href: '/', icon: Megaphone },
    { name: 'İşlemler / Fiyatlar', href: '/services', icon: Briefcase },
    { name: 'Bilgi / Satış Scriptleri', href: '/product-scripts', icon: MessageSquare },
    { name: 'Hızlı Yanıtlar', href: '/scripts', icon: FileText },
    { name: 'Formlar', href: '/forms', icon: ClipboardList },
    { name: 'Çalışanlarımız', href: '/employees', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Top Header */}
            <div className="md:hidden flex h-16 items-center justify-between bg-slate-900 px-4 shrink-0 shadow-md relative z-30">
                <h1 className="font-bold text-white text-xl">Intranet Admin</h1>
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
                    <h1 className="font-bold text-white text-xl">Intranet Admin</h1>
                </div>

                {/* Mobile close button inside drawer (optional) - omitted for clean design */}

                <div className="flex flex-1 flex-col overflow-y-auto mt-4 md:mt-0">
                    <nav className="flex-1 space-y-1 px-3 py-4">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={closeSidebar}
                                    className={`group flex items-center px-3 py-3 md:py-2 text-sm font-medium rounded-md transition-colors ${isActive
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
                    </nav>
                </div>
            </div>
        </>
    );
}
