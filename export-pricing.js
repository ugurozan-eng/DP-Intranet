const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function main() {
    console.log("Veritabanından ürün, paket, kampanya ve ilişkili FİYAT analizleri çekiliyor...");
    const insights = await prisma.crmInsight.findMany({
        where: {
            products_mentioned: {
                not: null
            }
        }
    });

    // name => { count, setOfPrices: Set }
    const catalog = {};

    insights.forEach(insight => {
        try {
            const products = JSON.parse(insight.products_mentioned);
            let prices = [];

            if (insight.prices_mentioned && insight.prices_mentioned !== "None") {
                try {
                    prices = JSON.parse(insight.prices_mentioned);
                } catch (e) { }
            }

            if (Array.isArray(products)) {
                products.forEach(p => {
                    const clean = p.trim().toLowerCase();
                    if (clean.length > 2 && clean !== "none") {
                        if (!catalog[clean]) catalog[clean] = { count: 0, prices: new Set() };
                        catalog[clean].count += 1;

                        // If there are prices in the same chat, associate them with this product
                        if (Array.isArray(prices)) {
                            prices.forEach(price => {
                                if (price.trim().length > 0) catalog[clean].prices.add(price.trim());
                            });
                        }
                    }
                });
            }
        } catch (e) {
            // Ignore parse errors
        }
    });

    const dataRows = [];

    for (const [name, data] of Object.entries(catalog)) {
        let category = "Ürün / Hizmet";
        if (name.includes("kampanya") || name.includes("fırsat")) {
            category = "Kampanya";
        } else if (name.includes("paket")) {
            category = "Paket";
        }

        dataRows.push({
            "Kategori": category,
            "Hizmet/Ürün Adı": name.charAt(0).toUpperCase() + name.slice(1),
            "Bahsedilme Sayısı": data.count,
            "Sohbetlerde Geçen Fiyatlar": Array.from(data.prices).join(', ') || "Belirtilmemiş"
        });
    }

    // Sort by count descending
    dataRows.sort((a, b) => b["Bahsedilme Sayısı"] - a["Bahsedilme Sayısı"]);

    // Create workbook
    const wb = xlsx.utils.book_new();

    // Split by category
    const campaigns = dataRows.filter(r => r["Kategori"] === "Kampanya");
    const packages = dataRows.filter(r => r["Kategori"] === "Paket");
    const products = dataRows.filter(r => r["Kategori"] === "Ürün / Hizmet");

    const wsAll = xlsx.utils.json_to_sheet(dataRows);
    const wsCamp = xlsx.utils.json_to_sheet(campaigns);
    const wsPack = xlsx.utils.json_to_sheet(packages);
    const wsProd = xlsx.utils.json_to_sheet(products);

    xlsx.utils.book_append_sheet(wb, wsAll, "Tümü (Fiyatlarla)");
    xlsx.utils.book_append_sheet(wb, wsProd, "Ürünler");
    xlsx.utils.book_append_sheet(wb, wsPack, "Paketler");
    xlsx.utils.book_append_sheet(wb, wsCamp, "Kampanyalar");

    const fileName = 'Urunler_Kampanyalar_ve_Fiyatlar.xlsx';
    xlsx.writeFile(wb, fileName);
    console.log(`Bitti! Fiyatları içeren Excel dosyası oluşturuldu: ${fileName}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
