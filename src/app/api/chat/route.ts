import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Fetch context from DB
    const [faqs, services, scripts, replies] = await Promise.all([
        prisma.faq.findMany(),
        prisma.service.findMany(),
        prisma.script.findMany(),
        prisma.quickReply.findMany(),
    ]);

    const dbContext = `
  Aşağıdaki veriler şirketin veritabanından çekilmiştir. Müşteri sorularını yanıtlarken öncelikle bu verileri kullanmalısın. Eğer sorunun yanıtı bu verilerde YOKSA, "Bu sorunun cevabı veritabanında bulunmamaktadır. Kendi bilgime göre yanıtlıyorum:" diyerek kendi bilgilerinle yanıt vermelisin.

  --- SIK SORULAN SORULAR ---
  ${faqs.map(f => `Soru: ${f.question}\nCevap: ${f.answer}`).join("\n\n")}

  --- HİZMETLER VE FİYATLAR ---
  ${services.map(s => `${s.category} - ${s.name} : Liste: ${s.listPrice} TL, Kampanyalı: ${s.campaignPrice} TL`).join("\n")}

  --- SATIŞ SCRIPTLERI (Taslak Mesajlar) ---
  ${scripts.map(s => `[${s.type}] ${s.name}: ${s.content}`).join("\n\n")}

  --- HIZLI YANITLAR ---
  ${replies.map(r => `${r.title}: ${r.content}`).join("\n")}
  `;

    const result = await streamText({
        model: google('gemini-2.5-flash'),
        system: dbContext,
        messages,
    });

    return result.toAIStreamResponse();
}
