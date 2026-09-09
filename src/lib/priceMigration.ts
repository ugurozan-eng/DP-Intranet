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

// September 2026 Updated Price Mapping (Column B: Eylül Zamlı Fiyatları)
const SEPTEMBER_PRICES: { [key: string]: number } = {
    // Botoks
    "5 Bölge Botoks": 5500,
    "3 Bölge Botoks": 5000,
    "Tek Bölge Botoks": 2500,
    "1 Bölge Botoks": 2500,
    "Terleme Botoksu": 7500,
    "Terleme Botoks": 7500,
    "5 Bölge Erkek Botoks": 7000,
    "3 Bölge Erkek Botoks": 5500,
    "Masseter Botoks": 7500,
    "Migren Botoks": 7500,

    // Dolgular
    "1 Ml Elasty Dolgu": 6000,
    "Elasty Dolgu": 6000,
    "1 Ml Sardenya Dolgu": 8000,
    "Sardenya Dolgu": 8000,
    "1 Ml Juvederm Dolgu": 12000,
    "Juvederm Dolgu": 12000,
    "1 Ml Saten Dolgu": 7000,
    "Saten Dolgu": 7000,
    "Burun Dolgusu": 12000,
    "Jawline": 25000,
    "Jawline (Çene hattı – 10 ml)": 25000,
    "Çene Ucu Dolgusu (2 ml)": 8000,
    "Orta Yüz Dolgusu (2 ml)": 8000,
    "Elmacık Kemiği Dolgusu (2 ml)": 8000,
    "Marionette Dolgu (2 ml)": 8000,
    "Nazolabial Dolgu (2 ml)": 8000,
    "Temporal şakak dolgusu (2 ml) (Elasty)": 12000,
    "Temporal Şakak Dolgusu (2 ml)": 12000,
    "Popo/Göğüs Dolgu (50ml X 2)": 50000,
    "Dolgu Eritme": 3000,

    // Aşılar & Mezoterapi
    "Mezoterapi (Seans)": 4500,
    "Mezoterapi": 4500,
    "PRP (Seans)": 3500,
    "PRP": 3500,
    "Gözaltı Mezoterapi (Seans)": 5500,
    "Gözaltı Mezoterapisi": 5500,
    "Harmonica (sıvı yüz germe)": 45000,
    "Harmonica Sıvı Yüz Germe": 45000,
    "Kleopatra aşısı (Seans)": 5500,
    "Kleopatra Aşısı": 5500,
    "Gençlik aşısı (Seans)": 5500,
    "Gençlik Aşısı": 5500,
    "Paris ışıltısı": 5500,
    "Paris Işıltısı": 5500,
    "Eksozom (Seans)": 8500,
    "Eksozom": 8500,
    "Somon DNA (Seans)": 16000,
    "Somon DNA": 16000,

    // Lipoliz
    "Lipoliz (Vücut zayıflama tek seans)": 5500,
    "Lipoliz (Vücut zayıflama 6 seans)": 30000,
    "Lipoliz Gıdı tek seans": 4000,
    "Lipoliz Gıdı (Tek Seans)": 4000,

    // İp & Germe
    "Fransız İp askı (4 ip fiyatı)": 20000,
    "Fransız İp Askı (4 İp)": 20000,
    "Örümcek Ağı (10 adet ip fiyatı)": 20000,
    "Örümcek Ağı (10 Adet İp)": 20000,
    "Fox Eyes (8 ip Fiyatı)": 40000,
    "Fox Eyes (8 İp)": 40000,
    "Full Face": 45000,
    "Sıvı Yüz Germe (Novuma veya toskana kullar)": 35000,
    "Sıvı Yüz Germe (Novuma / Toskani)": 35000
};

// Replace text prices cleanly in Quick Reply & Script contents
function updatePricesInText(text: string): string {
    if (!text) return text;
    let res = text;

    // Botoks replacements (Dysport)
    res = res.replace(/5\s*Bölge\s*Botoks\s*[:\-]?\s*4\.?990\s*TL/gi, "5 Bölge Botoks: 5.500 TL");
    res = res.replace(/3\s*Bölge\s*Botoks\s*[:\-]?\s*4\.?290\s*TL/gi, "3 Bölge Botoks: 5.000 TL");
    res = res.replace(/1\s*Bölge\s*Botoks\s*[:\-]?\s*2\.?500\s*TL/gi, "1 Bölge Botoks: 2.500 TL");
    res = res.replace(/Tek\s*Bölge\s*Botoks\s*[:\-]?\s*2\.?500\s*TL/gi, "Tek Bölge Botoks: 2.500 TL");
    res = res.replace(/5\s*Bölge\s*Erkek\s*Botoks\s*[:\-]?\s*6\.?990\s*TL/gi, "5 Bölge Erkek Botoks: 7.000 TL");
    res = res.replace(/3\s*Bölge\s*Erkek\s*Botoks\s*[:\-]?\s*4\.?990\s*TL/gi, "3 Bölge Erkek Botoks: 5.500 TL");
    res = res.replace(/Masseter\s*Botoks\s*[:\-]?\s*6\.?990\s*TL/gi, "Masseter Botoks: 7.500 TL");
    res = res.replace(/Migren\s*Botoks\s*[:\-]?\s*6\.?990\s*TL/gi, "Migren Botoks: 7.500 TL");
    res = res.replace(/Terleme\s*Botoks(u)?\s*[:\-]?\s*7\.?000\s*TL/gi, "Terleme Botoksu: 7.500 TL");

    // Dolgular
    res = res.replace(/1\s*Ml\s*Elasty\s*Dolgu\s*[:\-]?\s*4\.?990\s*TL/gi, "1 Ml Elasty Dolgu: 6.000 TL");
    res = res.replace(/1\s*Ml\s*Sardenya\s*Dolgu\s*[:\-]?\s*7\.?500\s*TL/gi, "1 Ml Sardenya Dolgu: 8.000 TL");
    res = res.replace(/1\s*Ml\s*Juvederm\s*Dolgu\s*[:\-]?\s*9\.?000\s*TL/gi, "1 Ml Juvederm Dolgu: 12.000 TL");
    res = res.replace(/1\s*Ml\s*Saten\s*Dolgu\s*[:\-]?\s*6\.?990\s*TL/gi, "1 Ml Saten Dolgu: 7.000 TL");
    res = res.replace(/Burun\s*Dolgusu\s*[:\-]?\s*6\.?990\s*TL/gi, "Burun Dolgusu: 12.000 TL");
    res = res.replace(/Jawline\s*(\([^\)]*\))?\s*[:\-]?\s*24\.?990\s*TL/gi, "Jawline (Çene hattı – 10 ml): 25.000 TL");
    res = res.replace(/Çene\s*Ucu\s*Dolgusu\s*(\([^\)]*\))?\s*[:\-]?\s*7\.?990\s*TL/gi, "Çene Ucu Dolgusu (2 ml): 8.000 TL");
    res = res.replace(/Orta\s*Yüz\s*Dolgusu\s*(\([^\)]*\))?\s*[:\-]?\s*7\.?990\s*TL/gi, "Orta Yüz Dolgusu (2 ml): 8.000 TL");
    res = res.replace(/Elmacık\s*Kemiği\s*Dolgusu\s*(\([^\)]*\))?\s*[:\-]?\s*7\.?990\s*TL/gi, "Elmacık Kemiği Dolgusu (2 ml): 8.000 TL");
    res = res.replace(/Marionette\s*Dolgu\s*(\([^\)]*\))?\s*[:\-]?\s*7\.?990\s*TL/gi, "Marionette Dolgu (2 ml): 8.000 TL");
    res = res.replace(/Nazolabial\s*Dolgu\s*(\([^\)]*\))?\s*[:\-]?\s*7\.?990\s*TL/gi, "Nazolabial Dolgu (2 ml): 8.000 TL");
    res = res.replace(/Temporal\s*(şakak)?\s*dolgusu\s*(\([^\)]*\))?\s*[:\-]?\s*7\.?990\s*TL/gi, "Temporal Şakak Dolgusu (2 ml): 12.000 TL");
    res = res.replace(/Popo\s*\/?\s*Göğüs\s*Dolgu\s*(\([^\)]*\))?\s*[:\-]?\s*49\.?990\s*TL/gi, "Popo/Göğüs Dolgu (50ml X 2): 50.000 TL");
    res = res.replace(/Dolgu\s*Eritme\s*[:\-]?\s*2\.?990\s*TL/gi, "Dolgu Eritme: 3.000 TL");

    // Aşılar & Mezoterapiler
    res = res.replace(/Gözaltı\s*Mezoterapi(si)?\s*(\([^\)]*\))?\s*[:\-]?\s*4\.?000\s*TL/gi, "Gözaltı Mezoterapi (Seans): 5.500 TL");
    res = res.replace(/Harmonica\s*(\([^\)]*\))?\s*[:\-]?\s*35\.?000\s*TL/gi, "Harmonica (sıvı yüz germe): 45.000 TL");
    res = res.replace(/Kleopatra\s*aşısı\s*(\([^\)]*\))?\s*[:\-]?\s*4\.?000\s*TL/gi, "Kleopatra aşısı (Seans): 5.500 TL");
    res = res.replace(/Gençlik\s*aşısı\s*(\([^\)]*\))?\s*[:\-]?\s*4\.?000\s*TL/gi, "Gençlik aşısı (Seans): 5.500 TL");
    res = res.replace(/Paris\s*ışıltısı\s*[:\-]?\s*4\.?000\s*TL/gi, "Paris ışıltısı: 5.500 TL");
    res = res.replace(/Eksozom\s*(\([^\)]*\))?\s*[:\-]?\s*7\.?990\s*TL/gi, "Eksozom (Seans): 8.500 TL");
    res = res.replace(/Somon\s*DNA\s*(\([^\)]*\))?\s*[:\-]?\s*12\.?000\s*TL/gi, "Somon DNA (Seans): 16.000 TL");

    // Lipoliz
    res = res.replace(/Lipoliz\s*Gıdı\s*(tek seans)?\s*[:\-]?\s*3\.?500\s*TL/gi, "Lipoliz Gıdı tek seans: 4.000 TL");

    // İp & Germe
    res = res.replace(/Fransız\s*İp\s*askı\s*(\([^\)]*\))?\s*[:\-]?\s*9\.?990\s*TL/gi, "Fransız İp askı (4 ip fiyatı): 20.000 TL");
    res = res.replace(/Örümcek\s*Ağı\s*(\([^\)]*\))?\s*[:\-]?\s*9\.?990\s*TL/gi, "Örümcek Ağı (10 adet ip fiyatı): 20.000 TL");
    res = res.replace(/Fox\s*Eyes\s*(\([^\)]*\))?\s*[:\-]?\s*19\.?990\s*TL/gi, "Fox Eyes (8 ip Fiyatı): 40.000 TL");
    res = res.replace(/Full\s*Face\s*[:\-]?\s*34\.?990\s*TL/gi, "Full Face: 45.000 TL");
    res = res.replace(/Sıvı\s*Yüz\s*Germe\s*(\([^\)]*\))?\s*[:\-]?\s*24\.?990\s*TL/gi, "Sıvı Yüz Germe (Novuma veya toskana kullar): 35.000 TL");

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

        // Step B: Update Services in DB (department: KLINIK ONLY)
        for (const [treatmentName, newPrice] of Object.entries(SEPTEMBER_PRICES)) {
            await prisma.service.updateMany({
                where: {
                    department: "KLINIK",
                    name: { equals: treatmentName, mode: "insensitive" }
                },
                data: {
                    campaignPrice: newPrice,
                    listPrice: newPrice
                }
            });
        }

        // Step C: Update Quick Replies text contents (department: KLINIK ONLY)
        for (const reply of existingReplies) {
            const updatedContent = updatePricesInText(reply.content);
            if (updatedContent !== reply.content) {
                await prisma.quickReply.update({
                    where: { id: reply.id },
                    data: { content: updatedContent }
                });
            }
        }

        // Step D: Update Product Scripts text contents (department: KLINIK ONLY)
        for (const script of existingScripts) {
            const updatedContent = updatePricesInText(script.content);
            if (updatedContent !== script.content) {
                await prisma.script.update({
                    where: { id: script.id },
                    data: { content: updatedContent }
                });
            }
        }

        revalidatePath("/services");
        revalidatePath("/scripts");
        revalidatePath("/product-scripts");

        return { success: true, message: "Eylül zamlı fiyatları KLİNİK departmanına başarıyla uygulandı ve yedek alındı." };
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
