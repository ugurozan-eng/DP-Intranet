import { prisma } from "@/lib/prisma";
import { ScriptForm, QuickReplyForm, CopyBtn, DelBtn } from "./ClientComponents";

export const dynamic = 'force-dynamic';

export default async function ScriptsPage() {
    const scripts = await prisma.script.findMany({ orderBy: { type: 'asc' } });
    const quickReplies = await prisma.quickReply.findMany({ orderBy: { title: 'asc' } });

    const scriptTypes = Array.from(new Set(scripts.map(s => s.type)));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Satış Scriptleri ve Kampanyalar</h1>
                <p className="text-slate-500 mt-2">Taslak metinler ve kampanya mesajlarını kopyalayarak hızlıca gönderin.</p>
                <div className="mt-6">
                    <ScriptForm />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {scripts.map(script => (
                    <div key={script.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:border-blue-300 transition-colors">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-xl">
                            <div>
                                <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-2">
                                    {script.type}
                                </span>
                                <h3 className="font-bold text-slate-800 leading-tight">{script.name}</h3>
                            </div>
                            <div className="flex gap-1 ml-4 shadow-sm border border-slate-200 rounded-lg bg-white">
                                <CopyBtn text={script.content} />
                                <div className="w-px bg-slate-200"></div>
                                <DelBtn id={script.id} isScript={true} />
                            </div>
                        </div>
                        <div className="p-5 flex-1 bg-slate-50/50">
                            <p className="text-sm text-slate-600 whitespace-pre-wrap font-mono">{script.content}</p>
                        </div>
                    </div>
                ))}
                {scripts.length === 0 && (
                    <div className="col-span-full text-center py-12 rounded-xl border border-dashed border-slate-300 text-slate-500">
                        Kayıtlı script bulunmuyor.
                    </div>
                )}
            </div>

            <div className="border-t border-slate-200 pt-10">
                <h2 className="text-2xl font-bold text-slate-900">Hızlı Cevaplar</h2>
                <p className="text-slate-500 mt-2">Sık kullanılan kısa yanıtlar.</p>

                <QuickReplyForm />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {quickReplies.map(reply => (
                        <div key={reply.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col relative group transition-all hover:shadow-md">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl font-medium text-slate-800 relative pr-16 truncate">
                                {reply.title}
                                <div className="absolute top-1/2 -translate-y-1/2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-slate-200 rounded-md">
                                    <CopyBtn text={reply.content} />
                                    <div className="w-px bg-slate-200"></div>
                                    <DelBtn id={reply.id} isScript={false} />
                                </div>
                            </div>
                            <div className="p-4 flex-1">
                                <p className="text-sm text-slate-600 line-clamp-3" title={reply.content}>{reply.content}</p>
                            </div>
                        </div>
                    ))}
                    {quickReplies.length === 0 && (
                        <div className="col-span-full py-8 text-slate-500 italic">
                            Kayıtlı hızlı cevap bulunmuyor.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
