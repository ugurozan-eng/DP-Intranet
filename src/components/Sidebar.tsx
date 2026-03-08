import Link from "next/link";
import {
    LayoutDashboard,
    MessageSquare,
    Settings,
    HelpCircle,
    FileText,
    AlertTriangle,
    Briefcase,
    ShieldAlert,
    Users,
    ClipboardList,
    Megaphone
} from "lucide-react";

const navigation = [
    { name: 'Duyurular / Kampanyalar', href: '/', icon: Megaphone },
    { name: 'Çalışanlarımız', href: '/employees', icon: Users },
    { name: 'İşlemler / Fiyatlar', href: '/services', icon: Briefcase },
    { name: 'Hızlı Yanıtlar', href: '/scripts', icon: FileText },
    { name: 'Formlar', href: '/forms', icon: ClipboardList },
    { name: 'AI Assistant', href: '/ai-chat', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    return (
        <div className="flex h-full w-64 flex-col bg-slate-900">
            <div className="flex h-16 shrink-0 items-center px-6">
                <h1 className="font-bold text-white text-xl">Intranet Admin</h1>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <item.icon
                                className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white"
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
