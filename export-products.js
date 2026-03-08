const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function main() {
    console.log("Veritabanından ürün, paket ve kampanya analizleri çekiliyor...");
    const insights = await prisma.crmInsight.findMany({
        where: {
            products_mentioned: {
                not: null
            }
        }
    });

    const counts = {};

    insights.forEach(insight => {
        try {
            const products = JSON.parse(insight.products_mentioned);
            if (Array.isArray(products)) {
                products.forEach(p => {
                    const clean = p.trim().toLowerCase();
                    if (clean.length > 2 && clean !== "none") {
                        counts[clean] = (counts[clean] || 0) + 1;
                    }
                });
            }
        } catch (e) {
            // Ignore parse errors
        }
    });

    const dataRows = [];

    for (const [name, count] of Object.entries(counts)) {
        let category = "Ürün / Hizmet";
        if (name.includes("kampanya") || name.includes("fırsat")) {
            category = "Kampanya";
        } else if (name.includes("paket")) {
            category = "Paket";
        }

        dataRows.push({
            "Kategori": category,
            "Adı": name.charAt(0).toUpperCase() + name.slice(1),
            "Bahsedilme Sayısı": count
        });
    }

    // Sort by count descending
    dataRows.sort((a, b) => b["Bahsedilme Sayısı"] - a["Bahsedilme Sayısı"]);

    // Create workbook
    const wb = xlsx.utils.book_new();

    // Split by category for different sheets
    const campaigns = dataRows.filter(r => r["Kategori"] === "Kampanya");
    const packages = dataRows.filter(r => r["Kategori"] === "Paket");
    const products = dataRows.filter(r => r["Kategori"] === "Ürün / Hizmet");

    const wsAll = xlsx.utils.json_to_sheet(dataRows);
    const wsCamp = xlsx.utils.json_to_sheet(campaigns);
    const wsPack = xlsx.utils.json_to_sheet(packages);
    const wsProd = xlsx.utils.json_to_sheet(products);

    xlsx.utils.book_append_sheet(wb, wsAll, "Tümü");
    xlsx.utils.book_append_sheet(wb, wsProd, "Ürünler");
    xlsx.utils.book_append_sheet(wb, wsPack, "Paketler");
    xlsx.utils.book_append_sheet(wb, wsCamp, "Kampanyalar");

    const fileName = 'Urunler_ve_Kampanyalar.xlsx';
    xlsx.writeFile(wb, fileName);
    console.log(`Bitti! Excel dosyası oluşturuldu: ${fileName}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
