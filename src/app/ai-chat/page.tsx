"use client";

import { useChat } from "ai/react";
import { Send } from "lucide-react";

export default function AiChatPage() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-white px-8 py-6 border-b border-slate-200 shrink-0">
                <h1 className="text-3xl font-bold text-slate-900">Yapay Zeka Asistanı</h1>
                <p className="text-slate-500 mt-2">
                    Veritabanınızdaki fiyatları, hizmetleri ve sık sorulan soruları analiz ederek yanıt verir.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <p>Size nasıl yardımcı olabilirim?</p>
                    </div>
                )}

                {messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${m.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-bl-none'
                            }`}>
                            <div className="font-semibold text-xs mb-1 opacity-70">
                                {m.role === 'user' ? 'Sen' : 'Asistan'}
                            </div>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 text-slate-800 shadow-sm rounded-2xl rounded-bl-none px-5 py-4 flex gap-1">
                            <span className="animate-bounce w-2 h-2 bg-slate-400 rounded-full"></span>
                            <span className="animate-bounce w-2 h-2 bg-slate-400 rounded-full" style={{ animationDelay: "0.2s" }}></span>
                            <span className="animate-bounce w-2 h-2 bg-slate-400 rounded-full" style={{ animationDelay: "0.4s" }}></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-4 border-t border-slate-200 shrink-0">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            value={input}
                            placeholder="Veritabanı ile ilgili bir soru sorun... (Örn: Lazer fiyatları ne kadar?)"
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
