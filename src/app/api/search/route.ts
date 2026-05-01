import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    const q = query.toLowerCase();

    try {
        // Run queries in parallel
        const [announcements, services, scripts, quickReplies, employees, faqs] = await Promise.all([
            prisma.announcement.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { content: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: 10
            }),
            prisma.service.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { category: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: 10
            }),
            prisma.script.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { content: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: 10
            }),
            prisma.quickReply.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { content: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: 10
            }),
            prisma.employee.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { department: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: 10
            }),
            prisma.faq.findMany({
                where: {
                    OR: [
                        { question: { contains: q, mode: 'insensitive' } },
                        { answer: { contains: q, mode: 'insensitive' } }
                    ]
                },
                take: 10
            })
        ]);

        const results = [];

        for (const a of announcements) {
            results.push({
                id: `announcement-${a.id}`,
                title: a.title,
                description: a.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...', // strip html
                url: '/',
                type: 'Duyuru / Kampanya'
            });
        }

        for (const s of services) {
            results.push({
                id: `service-${s.id}`,
                title: s.name,
                description: `Kategori: ${s.category} - Fiyat: ${s.campaignPrice || s.listPrice || 'Belirtilmemiş'}₺`,
                url: '/services',
                type: 'İşlem / Fiyat'
            });
        }

        for (const s of scripts) {
            results.push({
                id: `script-${s.id}`,
                title: s.name,
                description: s.content.substring(0, 150) + '...',
                url: '/product-scripts',
                type: 'Bilgi / Satış Scripti'
            });
        }

        for (const q of quickReplies) {
            results.push({
                id: `qr-${q.id}`,
                title: q.title,
                description: q.content.substring(0, 150) + '...',
                url: '/scripts',
                type: 'Hızlı Yanıt'
            });
        }

        for (const e of employees) {
            results.push({
                id: `emp-${e.id}`,
                title: e.name,
                description: `Departman: ${e.department}`,
                url: '/employees',
                type: 'Çalışan'
            });
        }

        for (const f of faqs) {
            results.push({
                id: `faq-${f.id}`,
                title: f.question,
                description: f.answer.substring(0, 150) + '...',
                url: '/faq',
                type: 'Sıkça Sorulan Soru'
            });
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Arama sırasında bir hata oluştu" }, { status: 500 });
    }
}
