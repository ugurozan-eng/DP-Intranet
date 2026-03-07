import { prisma } from "@/lib/prisma";
import { FaqForm, FaqAccordionItem } from "./ClientComponents";

export const dynamic = 'force-dynamic';

export default async function FaqsPage() {
    const faqs = await prisma.faq.findMany({ orderBy: { createdAt: 'desc' } });

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Sık Sorulan Sorular (SSS)</h1>
                <p className="text-slate-500 mt-2">Müşterilerden gelen standart soruları ve şablon yanıtları yönetin.</p>
                <div className="mt-6">
                    <FaqForm />
                </div>
            </div>

            <div className="space-y-1">
                {faqs.map(faq => (
                    <FaqAccordionItem
                        key={faq.id}
                        id={faq.id}
                        question={faq.question}
                        answer={faq.answer}
                    />
                ))}
                {faqs.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <h3 className="text-lg font-medium text-slate-900">Henüz SSS eklenmedi</h3>
                        <p className="text-slate-500 mt-1">Sık sorulan soruları ekleyerek listeyi oluşturabilirsiniz.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
