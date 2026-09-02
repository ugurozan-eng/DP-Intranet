"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { resetAdminPassword } from "../actions";

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus(null);
        const form = e.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            const res = await resetAdminPassword(formData);
            if (res.error) {
                setStatus({ type: 'error', text: res.error });
            } else {
                setStatus({ type: 'success', text: 'Admin şifreniz başarıyla sıfırlandı! Artık yeni şifrenizle giriş yapabilirsiniz.' });
                form.reset();
            }
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-6">
                    <div className="mx-auto bg-blue-50 text-blue-600 rounded-2xl w-14 h-14 flex items-center justify-center mb-3">
                        <KeyRound size={26} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Şifre Sıfırlama</h1>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                        Site Ana Giriş Şifresiyle doğrulayarak <b>ugurozan@gmail.com</b> hesabınız için yeni bir Admin şifresi belirleyebilirsiniz.
                    </p>
                </div>

                {status && (
                    <div className={`p-4 rounded-xl mb-5 text-xs flex items-center gap-2.5 ${
                        status.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold' 
                        : 'bg-red-50 text-red-700 border border-red-200 font-semibold'
                    }`}>
                        {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : <ShieldAlert size={18} className="shrink-0 text-red-600" />}
                        <span>{status.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Site Ana Giriş Şifresi
                        </label>
                        <input
                            required
                            name="sitePassword"
                            type="password"
                            placeholder="Sitenin kilit şifresi..."
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Yeni Admin Hesap Şifresi
                        </label>
                        <input
                            required
                            name="newPassword"
                            type="password"
                            placeholder="En az 6 karakter..."
                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                        {isPending && <Loader2 size={16} className="animate-spin text-white" />}
                        Şifremi Sıfırla & Güncelle
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Giriş Ekranına Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
