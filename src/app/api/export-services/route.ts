import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as xlsx from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });

        // Prepare data for Excel
        const data = services.map(s => ({
            'Kategori / Alan': s.category,
            'İşlem Adı': s.name,
            'Liste Fiyatı': s.listPrice ? `${s.listPrice} TL` : '0 TL',
            'Kampanyalı Fiyat': s.campaignPrice ? `${s.campaignPrice} TL` : '0 TL'
        }));

        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'İşlemler ve Fiyatlar');

        const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="islemler_fiyatlar.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
