import { prisma } from "@/lib/prisma";
import { MessageCircleQuestion, BotMessageSquare } from "lucide-react";

export default async function RealFaqs() {
    // Fetch real questions from customers
    const questions = await prisma.message.findMany({
        where: {
            direction: {
                contains: "Gelen"
            },
            content: {
                contains: "?"
            }
        },
        orderBy: {
            message_id: 'desc'
        },
        take: 50 // Fetch a pool to filter out short ones
    });

    const validPairs = [];

    for (const q of questions) {
        if (!q.content || q.content.length < 15) continue; // Skip too short questions like "Nerede?"

        // Find the immediate next response by the business
        const answer = await prisma.message.findFirst({
            where: {
                chat_id: q.chat_id,
                direction: {
                    contains: "Giden"
                },
                message_id: {
                    gt: q.message_id
                }
            },
            orderBy: {
                message_id: 'asc'
            }
        });

        if (answer && answer.content && answer.content.length > 20) {
            // We found a solid Q&A pair!
            validPairs.push({
                question: q.content,
                answer: answer.content,
                date: q.date
            });
        }

        if (validPairs.length >= 10) break; // Limit to 10
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden mt-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-bl-full -z-10" />

            <div className="mb-8">
                <h3 className="text-2xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight flex items-center gap-3">
                    <MessageCircleQuestion className="text-orange-500" size={28} />
                    Müşterilerin En Çok Sorduğu Gerçek Sorular
                </h3>
                <p className="text-slate-500 font-medium mt-1">
                    WhatsApp loglarınızdan otomatik ayıklanmış, size sorulan 10 gerçek soru ve işletmenizin onlara verdiği cevaplar.
                </p>
            </div>

            <div className="space-y-6">
                {validPairs.map((pair, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                                    M
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 text-[15px]">{pair.question}</p>
                                <span className="text-xs text-slate-400 font-medium">{pair.date}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4 pl-4 border-l-2 border-orange-200 ml-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <BotMessageSquare size={16} />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-600 text-[15px] leading-relaxed">{pair.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {validPairs.length === 0 && (
                    <p className="text-slate-500 text-center py-6">Kriterlere uygun soru-cevap eşleşmesi bulunamadı.</p>
                )}
            </div>
        </div>
    );
}
