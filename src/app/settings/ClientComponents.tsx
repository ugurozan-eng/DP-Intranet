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
