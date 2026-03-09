import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 text-center">
                <div className="mx-auto bg-blue-50 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <Mail size={28} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Şifrenizi Mi Unuttunuz?</h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    İntranet sistemine güvenlik sebebiyle otomatik şifre sıfırlama kapalıdır. Lütfen yeni şifre tanımlaması için sistem yöneticisine (IT Departmanı) başvurunuz.
                </p>

                <Link
                    href="/login"
                    className="flex justify-center items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft size={16} />
                    Giriş Sayfasına Dön
                </Link>
            </div>
        </div>
    );
}
