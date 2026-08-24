"use client";

import { useState, useTransition, Suspense } from "react";
import { submitUnlock } from "./actions";
import { Lock, KeyRound, Eye, EyeOff, Loader2, ShieldAlert, ArrowRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function UnlockForm() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();
    const router = useRouter();
    const fromPath = searchParams.get("from") || "/";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!password) {
            setError("Lütfen site giriş şifresini girin.");
            return;
        }

        startTransition(async () => {
            const res = await submitUnlock(password);
            if (res.error) {
                setError(res.error);
            } else {
                router.push(fromPath);
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md relative z-10 transition-all duration-300">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-slate-900 to-blue-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
                    <Lock size={30} className="text-blue-300" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">DP İntranet</h1>
                <p className="text-sm font-medium text-slate-500 mt-2">
                    Sistem genel kilit altındadır. Devam etmek için lütfen genel site giriş şifresini girin.
                </p>
            </div>

            {error && (
                <div className="bg-red-50/90 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl mb-6 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
                    <ShieldAlert size={20} className="shrink-0 text-red-500" />
                    <span className="font-medium leading-snug">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Site Giriş Parolası
                    </label>
                    <div className="relative flex items-center">
                        <KeyRound size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                        <input
                            required
                            autoFocus
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                            title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-4 px-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-slate-900/25 disabled:opacity-60 flex items-center justify-center gap-2 group"
                >
                    {isPending ? (
                        <>
                            <Loader2 size={20} className="animate-spin text-blue-300" />
                            <span>Kontrol Ediliyor...</span>
                        </>
                    ) : (
                        <>
                            <span>Giriş Yap & Erişime Aç</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-medium">
                    Dilan Polat Kurumsal İntranet Portalı &copy; 2026
                </p>
            </div>
        </div>
    );
}

export default function UnlockPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black p-4 relative overflow-hidden">
            {/* Background Decorative Gradients */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            <Suspense fallback={
                <div className="bg-white/90 p-8 rounded-3xl text-center text-slate-600">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Yükleniyor...
                </div>
            }>
                <UnlockForm />
            </Suspense>
        </div>
    );
}
