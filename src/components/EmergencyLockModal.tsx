"use client";

import { useState, useTransition } from "react";
import { ShieldAlert, Lock, Loader2, KeyRound } from "lucide-react";
import { emergencyLockSite } from "@/lib/siteLock";

export function EmergencyLockModal({ user }: { user: { email: string, role: string } | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Strictly available ONLY to ADMIN
    if (!user || user.role !== 'ADMIN') return null;

    const handleConfirmLock = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmed = newPassword.trim();
        if (!trimmed || trimmed.length < 3) {
            setError("Yeni kilit şifresi en az 3 karakter olmalıdır.");
            return;
        }

        startTransition(async () => {
            const res = await emergencyLockSite(trimmed);
            if (res?.error) {
                setError(res.error);
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-950/40 border border-red-800/40 rounded-lg hover:bg-red-900/60 hover:text-white transition-all shadow-xs group"
                title="Sadece Yönetici: Tüm oturumları anında sonlandırır ve siteyi yeni şifreyle kilitler"
            >
                <ShieldAlert size={14} className="text-red-400 group-hover:scale-110 transition-transform" />
                Acil Durum Kilidi
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-red-200 shadow-2xl w-full max-w-md p-6 sm:p-7 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Red Top Accent */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <ShieldAlert size={26} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Acil Durum Kilidi (Kill-Switch)</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Tüm aktif oturumları anında düşürün ve siteyi kilitleyin.</p>
                            </div>
                        </div>

                        {/* Warning Box */}
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 text-xs text-red-800 space-y-1.5">
                            <p className="font-bold flex items-center gap-1.5">
                                ⚠️ DİKKAT: Bu işlem geri alınamaz!
                            </p>
                            <p className="text-red-700 leading-relaxed">
                                Bu butona bastığınız anda şirket genelindeki **tüm açık bilgisayar ve telefonlardaki oturumlar derhal sonlandırılır** ve site herkese kilitlenir.
                            </p>
                            <p className="text-red-700 leading-relaxed">
                                Eski şifre geçersiz kalır; siteye sadece şimdi belirleyeceğiniz **yeni şifre** ile girilebilir.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-rose-100 border border-rose-300 text-rose-800 px-3.5 py-2.5 rounded-xl mb-4 text-xs font-semibold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleConfirmLock} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Yeni Site Giriş Şifresi Belirleyin
                                </label>
                                <div className="relative flex items-center">
                                    <KeyRound size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                                    <input
                                        required
                                        autoFocus
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Yeni gizli şifreniz..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">Bu şifreyi kimseyle paylaşmayınız.</p>
                            </div>

                            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setError(null);
                                        setNewPassword("");
                                    }}
                                    disabled={isPending}
                                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            <span>Kilitleniyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={14} />
                                            <span>Oturumları Kapat & Kilitle</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
