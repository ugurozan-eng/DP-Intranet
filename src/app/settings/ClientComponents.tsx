"use client";

import { useState, useTransition } from "react";
import { createUser, deleteUser } from "./actions";
import { Trash2, Loader2, UserPlus } from "lucide-react";

export function UserForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            const result = await createUser(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                form.reset();
            }
        });
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-10 w-full max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <UserPlus size={20} />
                </div>
                <h3 className="font-bold text-lg text-slate-800">Yeni Kullanıcı Hesabı Ekle</h3>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center">
                    <span className="font-semibold">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                        <input
                            required
                            name="email"
                            type="email"
                            placeholder="ornek@dilanpolat.com"
                            className="w-full border-slate-300 border rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                        <input
                            required
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full border-slate-300 border rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Yetki Grubu</label>
                    <select
                        required
                        name="role"
                        className="w-full border-slate-300 border rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                        defaultValue="USER"
                    >
                        <option value="USER">Kullanıcı (Kayıt Ekleyip/Silebilir, Ayarlara Giremez)</option>
                        <option value="ADMIN">Yönetici (Admin)</option>
                    </select>
                </div>

                <div className="pt-2">
                    <button type="submit" disabled={isPending} className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        Hesabı Oluştur
                    </button>
                </div>
            </form>
        </div>
    );
}

export function DeleteUserButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <button
            onClick={() => {
                if (confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) {
                    startTransition(() => deleteUser(id));
                }
            }}
            disabled={isPending}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Kullanıcıyı Sil"
        >
            <Trash2 size={18} />
        </button>
    );
}

import { Lock, KeyRound, CheckCircle2 } from "lucide-react";
import { updateSitePassword } from "@/lib/siteLock";

export function SitePasswordForm({ initialPassword }: { initialPassword: string }) {
    const [newPassword, setNewPassword] = useState(initialPassword);
    const [isPending, startTransition] = useTransition();
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatusMessage(null);

        startTransition(async () => {
            const res = await updateSitePassword(newPassword);
            if (res.error) {
                setStatusMessage({ type: 'error', text: res.error });
            } else {
                setStatusMessage({ type: 'success', text: 'Genel site giriş şifresi başarıyla güncellendi!' });
                setTimeout(() => setStatusMessage(null), 4000);
            }
        });
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-10 w-full max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
                    <Lock size={22} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Genel Site Giriş Şifresi</h3>
                    <p className="text-xs text-slate-500">Tüm personel siteye girerken istenen genel kilit şifresi.</p>
                </div>
            </div>

            {statusMessage && (
                <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2.5 ${
                    statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                    {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <Trash2 size={18} />}
                    <span className="font-semibold">{statusMessage.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                    <div className="relative flex items-center">
                        <KeyRound size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                        <input
                            required
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Örn: dp2026"
                            className="w-full pl-10 pr-4 py-2.5 border-slate-300 border rounded-xl text-slate-900 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 size={16} className="animate-spin text-amber-400" />}
                        Şifreyi Güncelle
                    </button>
                </div>
            </form>
        </div>
    );
}

import { changeAdminPassword } from "./actions";
import { UserCheck } from "lucide-react";

export function AdminPasswordChangeForm({ adminEmail }: { adminEmail: string }) {
    const [isPending, startTransition] = useTransition();
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatusMessage(null);
        const form = e.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            const res = await changeAdminPassword(formData);
            if (res.error) {
                setStatusMessage({ type: 'error', text: res.error });
            } else {
                setStatusMessage({ type: 'success', text: 'Admin hesap şifreniz başarıyla güncellendi!' });
                form.reset();
                setTimeout(() => setStatusMessage(null), 4000);
            }
        });
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-10 w-full max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                    <UserCheck size={22} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Admin Hesap Şifremi Değiştir</h3>
                    <p className="text-xs text-slate-500">Mevcut Admin hesabınız ({adminEmail}) için yeni bir şifre belirleyin.</p>
                </div>
            </div>

            {statusMessage && (
                <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2.5 ${
                    statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                    {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <Trash2 size={18} />}
                    <span className="font-semibold">{statusMessage.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                        <input
                            required
                            name="newPassword"
                            type="password"
                            placeholder="••••••••"
                            className="w-full border-slate-300 border rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre (Tekrar)</label>
                        <input
                            required
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="w-full border-slate-300 border rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 size={16} className="animate-spin text-white" />}
                        Hesap Şifremi Güncelle
                    </button>
                </div>
            </form>
        </div>
    );
}

import { applyKlinikSeptemberPrices, rollbackKlinikSeptemberPrices } from "@/lib/priceMigration";
import { ArrowUpRight, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react";

export function PriceMigrationManager() {
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleApply = () => {
        if (!confirm("⚠️ DİKKAT: KLİNİK departmanındaki tüm işlem fiyatları ve hazır mesaj şablonlarındaki fiyatlar Eylül Zamlı Fiyatları ile güncellenecektir. İşlemden önce otomatik tam yedek alınacaktır. Onaylıyor musunuz?")) return;

        startTransition(async () => {
            const res = await applyKlinikSeptemberPrices();
            if (res.error) {
                setMsg({ type: 'error', text: res.error });
            } else {
                setMsg({ type: 'success', text: res.message || "Fiyatlar başarıyla güncellendi!" });
            }
        });
    };

    const handleRollback = () => {
        if (!confirm("⚠️ GERİ YÜKLEME: Sistemdeki tüm fiyatlar ve mesaj şablonları güncelleme öncesindeki orijinal haline döndürülecektir. Emin misiniz?")) return;

        startTransition(async () => {
            const res = await rollbackKlinikSeptemberPrices();
            if (res.error) {
                setMsg({ type: 'error', text: res.error });
            } else {
                setMsg({ type: 'success', text: res.message || "Yedek başarıyla geri yüklendi!" });
            }
        });
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-10 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
                        <ArrowUpRight size={22} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Klinik Fiyat Güncelleme (Eylül Zamları)</h3>
                        <p className="text-xs text-slate-500">Sadece Klinik departmanının fiyatlarını ve hazır yanıtlarını tek tıkla günceller veya geri alır.</p>
                    </div>
                </div>
            </div>

            {msg && (
                <div className={`p-4 rounded-xl mb-5 text-xs font-semibold flex items-center gap-2.5 ${
                    msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {msg.type === 'success' ? <CheckCircle size={16} className="text-emerald-600 shrink-0" /> : <AlertTriangle size={16} className="text-red-600 shrink-0" />}
                    <span>{msg.text}</span>
                </div>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 mb-5 text-xs text-slate-600 space-y-2">
                <p>• <b>Güvenli Yedekleme:</b> Güncelle butonuna basıldığında mevcut tüm Klinik fiyatları ve hazır mesajları veritabanına otomatik yedeklenir.</p>
                <p>• <b>Kapsam:</b> Güzellik ve Dental departmanlarına asla dokunulmaz; yalnızca <b>KLİNİK</b> güncellenir.</p>
                <p>• <b>Geri Alma Garantisi:</b> Herhangi bir aksilikte <i>"Yedeğe Geri Dön"</i> butonuyla her şeyi anında eski haline çekebilirsiniz.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={handleApply}
                    disabled={isPending}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                    {isPending && <Loader2 size={15} className="animate-spin text-white" />}
                    Eylül Fiyatlarını Uygula
                </button>

                <button
                    onClick={handleRollback}
                    disabled={isPending}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-300 disabled:opacity-50 flex items-center gap-2"
                >
                    <RotateCcw size={15} className="text-slate-500" />
                    Önceki Yedeğe Geri Dön (Rollback)
                </button>
            </div>
        </div>
    );
}
