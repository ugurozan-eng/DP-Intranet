import { prisma } from "@/lib/prisma";
import { FaqClient } from "./FaqClient";
import { getUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
    const faqs = await prisma.faq.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
    const user = await getUser();

    return (
        <div className="p-4 md:p-8 max-w-[1700px] w-full mx-auto bg-slate-50 min-h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Sıkça Sorulan Sorular</h1>
                <p className="text-slate-500 mt-2 text-lg">Müşterilerden gelen sık sorulan sorular ve hazır cevapları.</p>
            </div>

            <div className="relative">
                <FaqClient faqs={faqs} user={user} />
            </div>
        </div>
    );
}
