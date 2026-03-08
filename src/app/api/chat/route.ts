import { createGoogleGenerativeAI } from "@ai-sdk/google";
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
Aşağıdaki veriler Dilan Polat Kliniğinin veritabanından çekilmiştir. Müşteri sorularını yanıtlarken öncelikle bu verileri kullanmalısın. 

ÇOK ÖNEMLİ KURAL: Sen sadece kliniğin iç işleyişi, fiyatlandırma, kampanyalar ve hizmetleri hakkında soru yanıtlayabilen Ciddi ve Kurumsal bir Asistansın! Eğer kullanıcının sorduğu soru (matematik, genel kültür, kodlama, günlük muhabbet, kişisel konular vb.) kliniğin hizmetleriyle ALAKASIZ bir şeyse, KESİNLİKLE CEVAP VERMEYECEKSİN. Alakasız sorularda yalnızca şunu söyle: "Size sadece kliniğimizin hizmetleri, fiyatları ve işleyişi hakkında yardımcı olabilirim."

Alakalı sorularda sorunun yanıtı bu verilerde bulunmuyorsa: "Bu işlemin fiyatı veya durumu veritabanında bulunmamaktadır. Şube yönetimine danışabilirsiniz." demelisin.

  --- SIK SORULAN SORULAR ---
  ${faqs.map(f => `Soru: ${f.question}\nCevap: ${f.answer}`).join("\n\n")}

  --- HİZMETLER VE FİYATLAR ---
  ${services.map(s => `${s.category} - ${s.name} : Liste: ${s.listPrice} TL, Kampanyalı: ${s.campaignPrice} TL`).join("\n")}

  --- SATIŞ SCRIPTLERI (Taslak Mesajlar) ---
  ${scripts.map(s => `[${s.type}] ${s.name}: ${s.content}`).join("\n\n")}

  --- HIZLI YANITLAR ---
  ${replies.map(r => `${r.title}: ${r.content}`).join("\n")}
  `;

    const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "AIzaSyA6O74E_Q7QHlsaMNboSKvr0uf-F7Aeb54",
    });

    const result = await streamText({
        model: google('gemini-2.5-flash'),
        system: dbContext,
        messages,
    });

    return result.toAIStreamResponse();
}
