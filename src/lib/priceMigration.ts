"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Ensure SystemSetting table exists in PostgreSQL database
async function ensureSystemSettingTable() {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "SystemSetting" (
                "key" TEXT PRIMARY KEY,
                "value" TEXT NOT NULL,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (e) {
        // Ignore if already exists
    }
}

// 1. SERVICES MAPPING FOR KLINIK (Matches all database name variations)
interface ServicePriceRule {
    matcher: (name: string, category: string) => boolean;
    price: number;
}

const SERVICE_RULES: ServicePriceRule[] = [
    // Botoks
    { matcher: (n, c) => (n.includes("5 Bölge") || n.includes("5 bölge")) && !n.toLowerCase().includes("erkek"), price: 5500 },
    { matcher: (n, c) => (n.includes("3 Bölge") || n.includes("3 bölge")) && !n.toLowerCase().includes("erkek"), price: 5000 },
    { matcher: (n, c) => n.toLowerCase().includes("tek bölge") || n.toLowerCase().includes("1 bölge"), price: 2500 },
    { matcher: (n, c) => n.toLowerCase().includes("terleme"), price: 7500 },
    { matcher: (n, c) => n.toLowerCase().includes("erkek") && n.includes("5"), price: 7000 },
    { matcher: (n, c) => n.toLowerCase().includes("erkek") && n.includes("3"), price: 5500 },
    { matcher: (n, c) => n.toLowerCase().includes("masseter"), price: 7500 },
    { matcher: (n, c) => n.toLowerCase().includes("migren"), price: 7500 },

    // Dolgu Markaları (1 ML)
    { matcher: (n, c) => n.toLowerCase().includes("elasty") && !n.toLowerCase().includes("şakak") && !n.toLowerCase().includes("temporal"), price: 6000 },
    { matcher: (n, c) => n.toLowerCase().includes("sardinya") || n.toLowerCase().includes("sardenya"), price: 8000 },
    { matcher: (n, c) => n.toLowerCase().includes("juvederm") || n.toLowerCase().includes("juvedrem"), price: 12000 },
    { matcher: (n, c) => n.toLowerCase().includes("saten"), price: 7000 },
    { matcher: (n, c) => n.toLowerCase().includes("burun"), price: 12000 },

    // Yüz Şekillendirme Dolguları
    { matcher: (n, c) => n.toLowerCase().includes("jawline"), price: 25000 },
    { matcher: (n, c) => n.toLowerCase().includes("çene ucu"), price: 8000 },
    { matcher: (n, c) => n.toLowerCase().includes("orta yüz"), price: 8000 },
    { matcher: (n, c) => n.toLowerCase().includes("elmacık"), price: 8000 },
    { matcher: (n, c) => n.toLowerCase().includes("marionette") || n.toLowerCase().includes("marionet"), price: 8000 },
    { matcher: (n, c) => n.toLowerCase().includes("nazolabial") || n.toLowerCase().includes("nazolabiel"), price: 8000 },
    { matcher: (n, c) => n.toLowerCase().includes("şakak") || n.toLowerCase().includes("temporal"), price: 12000 },
    { matcher: (n, c) => (n.toLowerCase().includes("popo") || n.toLowerCase().includes("meme") || n.toLowerCase().includes("göğüs")) && (n.includes("50") || c.toLowerCase().includes("popo") || c.toLowerCase().includes("meme")), price: 50000 },
    { matcher: (n, c) => n.toLowerCase().includes("eritme") || n.toLowerCase().includes("dolgu eritme"), price: 3000 },

    // Aşılar & Mezoterapi
    { matcher: (n, c) => n.toLowerCase().includes("göz altı") || n.toLowerCase().includes("gözaltı"), price: 5500 },
    { matcher: (n, c) => n.toLowerCase().includes("kleopatra"), price: 5500 },
    { matcher: (n, c) => n.toLowerCase().includes("gençlik aşısı") || n.toLowerCase().includes("genclik asisi"), price: 5500 },
    { matcher: (n, c) => n.toLowerCase().includes("paris ışıltısı") || n.toLowerCase().includes("paris isiltisi") || n.toLowerCase().includes("paris"), price: 5500 },
    { matcher: (n, c) => n.toLowerCase().includes("eksozom") || n.toLowerCase().includes("exosome"), price: 8500 },
    { matcher: (n, c) => n.toLowerCase().includes("somon dna") || n.toLowerCase().includes("somon"), price: 16000 },
    { matcher: (n, c) => n.toLowerCase().includes("prp") && !n.toLowerCase().includes("paket"), price: 3500 },
    { matcher: (n, c) => n.toLowerCase().includes("mezoterapi") && !n.toLowerCase().includes("göz") && !n.toLowerCase().includes("paket"), price: 4500 },

    // Lipoliz
    { matcher: (n, c) => n.toLowerCase().includes("gıdı") || n.toLowerCase().includes("gidi"), price: 4000 },
    { matcher: (n, c) => n.toLowerCase().includes("lipoliz") && n.includes("6"), price: 30000 },
    { matcher: (n, c) => n.toLowerCase().includes("lipoliz") && (n.includes("tek") || !n.includes("6")) && !n.toLowerCase().includes("gıdı"), price: 5500 },

    // İp & Germe
    { matcher: (n, c) => n.toLowerCase().includes("fransız") || n.toLowerCase().includes("fransiz"), price: 20000 },
    { matcher: (n, c) => n.toLowerCase().includes("örümcek") || n.toLowerCase().includes("orumcek"), price: 20000 },
    { matcher: (n, c) => n.toLowerCase().includes("fox eyes") || n.toLowerCase().includes("fox eye") || n.toLowerCase().includes("fox"), price: 40000 },
    { matcher: (n, c) => n.toLowerCase().includes("full face") || n.toLowerCase().includes("fullface"), price: 45000 },
    { matcher: (n, c) => n.toLowerCase().includes("harmonica"), price: 45000 },
    { matcher: (n, c) => (n.toLowerCase().includes("sıvı yüz germe") || n.toLowerCase().includes("sivi yuz germe") || n.toLowerCase().includes("kalsiyum hidroksiapatit") || n.toLowerCase().includes("novuma") || n.toLowerCase().includes("toskani")) && !n.toLowerCase().includes("harmonica"), price: 35000 }
];

// 2. COMPREHENSIVE TEXT PRICE REPLACEMENT ENGINE (Handles all spaces, symbols ₺/TL, formats, and variations)
function updatePricesInTextComprehensive(text: string): string {
    if (!text) return text;
    let res = text;

    // Helper for replacing patterns
    const replacePrice = (pattern: RegExp, replacement: string) => {
        res = res.replace(pattern, replacement);
    };

    // --- BOTOKS ---
    // 5 Bölge Botoks -> 5.500 TL
    replacePrice(/(5\s*Bölge(\s*Botoks)?\s*[:\-–]?\s*)(4\.?990|4\.?290|3\.?750|4\.?500|4\.?000)\s*(TL|tl|₺|lira)/gi, "$15.500 TL");
    // 3 Bölge Botoks -> 5.000 TL
    replacePrice(/(3\s*Bölge(\s*Botoks)?\s*[:\-–]?\s*)(4\.?290|3\.?750|3\.?500|4\.?000)\s*(TL|tl|₺|lira)/gi, "$15.000 TL");
    // 5 Bölge Erkek Botoks -> 7.000 TL
    replacePrice(/(5\s*Bölge\s*Erkek(\s*Botoks)?\s*[:\-–]?\s*)(6\.?990|6\.?500|6\.?000)\s*(TL|tl|₺|lira)/gi, "$17.000 TL");
    // 3 Bölge Erkek Botoks -> 5.500 TL
    replacePrice(/(3\s*Bölge\s*Erkek(\s*Botoks)?\s*[:\-–]?\s*)(4\.?990|4\.?500|4\.?290)\s*(TL|tl|₺|lira)/gi, "$15.500 TL");
    // Masseter Botoks -> 7.500 TL
    replacePrice(/(Masseter(\s*Botoks(u)?)?\s*[:\-–]?\s*)(6\.?990|5\.?500|5\.?000|6\.?000)\s*(TL|tl|₺|lira)/gi, "$17.500 TL");
    replacePrice(/(fiyatı\s*)(5\.?500|6\.?990)\s*(TL|tl|₺)\s*(dir|dir efendim)/gi, "$17.500 TL $4");
    // Migren Botoks -> 7.500 TL
    replacePrice(/(Migren(\s*Botoks(u)?)?\s*[:\-–]?\s*)(6\.?990|6\.?500|6\.?000)\s*(TL|tl|₺|lira)/gi, "$17.500 TL");
    // Terleme Botoksu -> 7.500 TL
    replacePrice(/(Terleme(\s*Botoks(u)?)?\s*[:\-–]?\s*)(7\.?000|5\.?500|6\.?000|6\.?990)\s*(TL|tl|₺|lira)/gi, "$17.500 TL");

    // --- DOLGULAR ---
    // 1 ML Elasty -> 6.000 TL
    replacePrice(/((1\s*ML\s*)?Elasty(\s*Dolgu(su)?)?\s*[:\-–]?\s*)(4\.?990|4\.?290|5\.?500|4\.?500)\s*(TL|tl|₺|lira)/gi, "$16.000 TL");
    // 1 ML Sardenya/Sardinya -> 8.000 TL
    replacePrice(/((1\s*ML\s*)?(Sardenya|Sardinya)(\s*Dolgu(su)?)?\s*[:\-–]?\s*)(7\.?500|5\.?500|6\.?990)\s*(TL|tl|₺|lira)/gi, "$18.000 TL");
    // 1 ML Juvederm -> 12.000 TL
    replacePrice(/((1\s*ML\s*)?Juvederm(\s*Dolgu(su)?)?\s*[:\-–]?\s*)(9\.?000|6\.?000|8\.?000)\s*(TL|tl|₺|lira)/gi, "$112.000 TL");
    // 1 ML Saten Dolgu -> 7.000 TL
    replacePrice(/((1\s*ML\s*)?Saten(\s*Dolgu(su)?)?\s*[:\-–]?\s*)(6\.?990|6\.?500)\s*(TL|tl|₺|lira)/gi, "$17.000 TL");
    // Burun Dolgusu -> 12.000 TL
    replacePrice(/(Burun\s*Dolgu(su)?\s*[:\-–]?\s*)(6\.?990|7\.?990|8\.?000|9\.?000)\s*(TL|tl|₺|lira)/gi, "$112.000 TL");
    // Jawline -> 25.000 TL
    replacePrice(/(Jawline(\s*\([^\)]*\))?\s*[:\-–]?\s*)(24\.?990|20\.?000|22\.?000)\s*(TL|tl|₺|lira)/gi, "$125.000 TL");
    // Çene Ucu Dolgusu -> 8.000 TL
    replacePrice(/(Çene\s*Ucu\s*Dolgu(su)?(\s*\([^\)]*\))?\s*[:\-–]?\s*)(7\.?990|7\.?500|5\.?500|6\.?990)\s*(TL|tl|₺|lira)/gi, "$18.000 TL");
    // Orta Yüz Dolgusu -> 8.000 TL
    replacePrice(/(Orta\s*Yüz\s*Dolgu(su)?(\s*\([^\)]*\))?\s*[:\-–]?\s*)(7\.?990|7\.?500|5\.?500|6\.?990)\s*(TL|tl|₺|lira)/gi, "$18.000 TL");
    // Elmacık Kemiği Dolgusu -> 8.000 TL
    replacePrice(/(Elmacık(\s*Kemiği)?\s*Dolgu(su)?(\s*\([^\)]*\))?\s*[:\-–]?\s*)(7\.?990|5\.?500|6\.?990)\s*(TL|tl|₺|lira)/gi, "$18.000 TL");
    // Marionette Dolgu -> 8.000 TL
    replacePrice(/(Marionette\s*Dolgu(su)?(\s*\([^\)]*\))?\s*[:\-–]?\s*)(7\.?990|4\.?000|5\.?500)\s*(TL|tl|₺|lira)/gi, "$18.000 TL");
    // Nazolabial Dolgu -> 8.000 TL
    replacePrice(/(Nazolabial\s*Dolgu(su)?(\s*\([^\)]*\))?\s*[:\-–]?\s*)(7\.?990|4\.?000|5\.?500)\s*(TL|tl|₺|lira)/gi, "$18.000 TL");
    // Şakak / Temporal Dolgu -> 12.000 TL
    replacePrice(/((Şakak|Temporal(\s*şakak)?)\s*Dolgu(su)?(\s*\([^\)]*\))?\s*[:\-–]?\s*)(7\.?990|5\.?500|6\.?990)\s*(TL|tl|₺|lira)/gi, "$112.000 TL");
    // Popo / Meme / Göğüs Dolgusu (50ml x 2) -> 50.000 TL
    replacePrice(/((Popo|Meme|Göğüs|Popo\s*\/\s*Göğüs)\s*Dolgu(su)?(\s*\([^\)]*\))?\s*[:\-–]?\s*)(49\.?990|25\.?000|45\.?000)\s*(TL|tl|₺|lira)/gi, "$150.000 TL");
    // Dolgu Eritme -> 3.000 TL
    replacePrice(/(Dolgu\s*Eritme\s*[:\-–]?\s*)(2\.?990|2\.?500)\s*(TL|tl|₺|lira)/gi, "$13.000 TL");

    // --- AŞILAR & MEZOTERAPİ ---
    // Gözaltı Mezoterapisi -> 5.500 TL
    replacePrice(/(Göz\s*altı\s*Mezoterapi(si)?(\s*\/seans|\s*\(Seans\))?\s*[:\-–]?\s*)(4\.?000|3\.?500|3\.?000)\s*(TL|tl|₺|lira)/gi, "$15.500 TL");
    // Kleopatra Aşısı -> 5.500 TL
    replacePrice(/(Kleopatra\s*Aşısı(\s*\(Seans\))?\s*[:\-–]?\s*)(4\.?000|3\.?500)\s*(TL|tl|₺|lira)/gi, "$15.500 TL");
    // Gençlik Aşısı -> 5.500 TL
    replacePrice(/(Gençlik\s*Aşısı(\s*\(Seans\))?\s*[:\-–]?\s*)(4\.?000|3\.?500)\s*(TL|tl|₺|lira)/gi, "$15.500 TL");
    // Paris Işıltısı -> 5.500 TL
    replacePrice(/(Paris\s*Işıltısı\s*[:\-–]?\s*)(4\.?000|3\.?500)\s*(TL|tl|₺|lira)/gi, "$15.500 TL");
    // Eksozom -> 8.500 TL
    replacePrice(/(Eksozom(\s*\(Seans\))?\s*[:\-–]?\s*)(7\.?990|7\.?500|7\.?000)\s*(TL|tl|₺|lira)/gi, "$18.500 TL");
    // Somon DNA -> 16.000 TL
    replacePrice(/(Somon\s*DNA(\s*\(Seans\))?\s*[:\-–]?\s*)(12\.?000|10\.?000)\s*(TL|tl|₺|lira)/gi, "$116.000 TL");

    // --- LİPOLİZ ---
    // Gıdı Lipoliz -> 4.000 TL
    replacePrice(/(Lipoliz\s*Gıdı(\s*tek seans)?\s*[:\-–]?\s*)(3\.?500|3\.?000)\s*(TL|tl|₺|lira)/gi, "$14.000 TL");

    // --- İP ASKI & YÜZ GERME ---
    // Fransız İp Askı (4 ip) -> 20.000 TL
    replacePrice(/(Fransız\s*(İp\s*)?Askı(\s*\([^\)]*\))?\s*[:\-–]?\s*)(9\.?990|10\.?000)\s*(TL|tl|₺|lira)/gi, "$120.000 TL");
    // Örümcek Ağı (10 ip) -> 20.000 TL
    replacePrice(/(Örümcek\s*Ağı(\s*(İpler|\([^\)]*\)))?\s*[:\-–]?\s*)(9\.?990|10\.?000)\s*(TL|tl|₺|lira)/gi, "$120.000 TL");
    // Fox Eyes (8 İp) -> 40.000 TL
    replacePrice(/(Fox\s*Eyes(\s*\([^\)]*\))?\s*[:\-–]?\s*)(19\.?990|20\.?000)\s*(TL|tl|₺|lira)/gi, "$140.000 TL");
    // Full Face -> 45.000 TL
    replacePrice(/(Full\s*Face\s*[:\-–]?\s*)(34\.?990|35\.?000)\s*(TL|tl|₺|lira)/gi, "$145.000 TL");
    // Harmonica -> 45.000 TL
    replacePrice(/(Harmonica(\s*\(sıvı yüz germe\))?\s*[:\-–]?\s*)(35\.?000|30\.?000)\s*(TL|tl|₺|lira)/gi, "$145.000 TL");
    // Sıvı Yüz Germe -> 35.000 TL
    replacePrice(/(Sıvı\s*Yüz\s*Germe(\s*\([^\)]*\))?\s*[:\-–]?\s*)(24\.?990|15\.?000|25\.?000)\s*(TL|tl|₺|lira)/gi, "$135.000 TL");

    return res;
}

// 1. BACKUP & APPLY MIGRATION (ONLY KLINIK)
export async function applyKlinikSeptemberPrices() {
    try {
        await ensureSystemSettingTable();

        // Step A: Snapshot current KLINIK services & quick replies before touching
        const existingServices = await prisma.service.findMany({ where: { department: "KLINIK" } });
        const existingReplies = await prisma.quickReply.findMany({ where: { department: "KLINIK" } });
        const existingScripts = await prisma.script.findMany({ where: { department: "KLINIK" } });

        const backupData = {
            timestamp: new Date().toISOString(),
            department: "KLINIK",
            services: existingServices,
            quickReplies: existingReplies,
            scripts: existingScripts
        };

        // Save backup to SystemSetting table
        try {
            await prisma.systemSetting.upsert({
                where: { key: "BACKUP_BEFORE_SEPTEMBER_2026_PRICES" },
                update: { value: JSON.stringify(backupData) },
                create: {
                    key: "BACKUP_BEFORE_SEPTEMBER_2026_PRICES",
                    value: JSON.stringify(backupData)
                }
            });
        } catch (backupErr) {
            console.error("Backup upsert error:", backupErr);
        }

        // Step B: Update Services in DB (department: KLINIK ONLY) using rule-based fuzzy matching
        let updatedServicesCount = 0;
        for (const s of existingServices) {
            for (const rule of SERVICE_RULES) {
                if (rule.matcher(s.name, s.category || "")) {
                    await prisma.service.update({
                        where: { id: s.id },
                        data: {
                            campaignPrice: rule.price,
                            listPrice: rule.price
                        }
                    });
                    updatedServicesCount++;
                    break;
                }
            }
        }

        // Step C: Update Quick Replies text contents (department: KLINIK ONLY)
        let updatedRepliesCount = 0;
        for (const reply of existingReplies) {
            const updatedContent = updatePricesInTextComprehensive(reply.content);
            if (updatedContent !== reply.content) {
                await prisma.quickReply.update({
                    where: { id: reply.id },
                    data: { content: updatedContent }
                });
                updatedRepliesCount++;
            }
        }

        // Step D: Update Product Scripts text contents (department: KLINIK ONLY)
        let updatedScriptsCount = 0;
        for (const script of existingScripts) {
            const updatedContent = updatePricesInTextComprehensive(script.content);
            if (updatedContent !== script.content) {
                await prisma.script.update({
                    where: { id: script.id },
                    data: { content: updatedContent }
                });
                updatedScriptsCount++;
            }
        }

        revalidatePath("/services");
        revalidatePath("/scripts");
        revalidatePath("/product-scripts");

        return { 
            success: true, 
            message: `Başarıyla güncellendi! (${updatedServicesCount} İşlem Fiyatı, ${updatedRepliesCount} Hazır Yanıt, ${updatedScriptsCount} Satış Scripti güncellendi)` 
        };
    } catch (e: any) {
        console.error("applyKlinikSeptemberPrices error:", e);
        return { error: e.message || "Fiyatlar güncellenirken bir hata oluştu." };
    }
}

// 2. ROLLBACK ACTION (EĞER SIÇARSAK TEK TIKLA GERİ ALMA)
export async function rollbackKlinikSeptemberPrices() {
    try {
        await ensureSystemSettingTable();

        const backupSetting = await prisma.systemSetting.findUnique({
            where: { key: "BACKUP_BEFORE_SEPTEMBER_2026_PRICES" }
        });

        if (!backupSetting || !backupSetting.value) {
            return { error: "Geri yüklenecek yedek bulunamadı!" };
        }

        const backup = JSON.parse(backupSetting.value);

        // Restore Services
        for (const s of backup.services) {
            await prisma.service.updateMany({
                where: { id: s.id, department: "KLINIK" },
                data: {
                    listPrice: s.listPrice,
                    campaignPrice: s.campaignPrice,
                    name: s.name,
                    category: s.category
                }
            });
        }

        // Restore Quick Replies
        for (const r of backup.quickReplies) {
            await prisma.quickReply.updateMany({
                where: { id: r.id, department: "KLINIK" },
                data: {
                    title: r.title,
                    content: r.content,
                    category: r.category,
                    topic: r.topic
                }
            });
        }

        // Restore Scripts
        for (const sc of backup.scripts) {
            await prisma.script.updateMany({
                where: { id: sc.id, department: "KLINIK" },
                data: {
                    name: sc.name,
                    content: sc.content,
                    type: sc.type
                }
            });
        }

        revalidatePath("/services");
        revalidatePath("/scripts");
        revalidatePath("/product-scripts");

        return { success: true, message: "Tüm fiyatlar ve hazır yanıtlar önceki haline eksiksiz geri döndürüldü!" };
    } catch (e: any) {
        console.error("rollbackKlinikSeptemberPrices error:", e);
        return { error: e.message || "Geri yükleme sırasında bir hata oluştu." };
    }
}
