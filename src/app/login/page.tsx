"use client";

import { useState, useTransition } from "react";
import { login } from "./actions";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Intranet Admin</h1>
                    <p className="text-slate-500 mt-2">Dilan Polat İntranet paneline giriş yapın.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center">
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                        <input
                            required
                            name="email"
                            type="email"
                            placeholder="admin@example.com"
                            className="w-full border-slate-300 border rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Şifre</label>
                            <Link href="/login/forgot" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Şifremi Unuttum?</Link>
                        </div>
                        <input
                            required
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="w-full border-slate-300 border rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                        {isPending && <Loader2 size={18} className="animate-spin" />}
                        Giriş Yap
                    </button>
                </form>
            </div>
        </div>
    );
}
