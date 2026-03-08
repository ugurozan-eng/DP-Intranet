const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function importExcel() {
    console.log("Starting excel import...");
    try {
        await prisma.service.deleteMany(); // Clear existing
        console.log("Existing services cleared.");

        const file = "C:\\Claude Projects\\intranet\\web\\klinik_fiyat_listesi.xlsx";
        const wb = xlsx.readFile(file);
        const sheetName = wb.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

        let currentCategory = "Genel";

        for (const row of data) {
            let islem = row['İşlem'];
            let kampanyaStr = row['Kampanyalı Fiyat'];
            let listeStr = row['Liste Fiyatı'];

            if (!islem) continue;

            if (!kampanyaStr && !listeStr) {
                // This is a header, e.g. "Botoks (Dysport)"
                currentCategory = islem.trim();
            } else {
                // This is a pricing row
                const parsePrice = (str) => {
                    if (!str) return 0;
                    if (typeof str === 'number') return str;
                    const cleanStr = String(str).replace(/TL/gi, '').trim();
                    const numStr = cleanStr.replace(/\./g, '').replace(/,/g, '.');
                    return parseFloat(numStr) || 0;
                }

                const campaignPrice = parsePrice(kampanyaStr);
                const listPrice = parsePrice(listeStr);

                await prisma.service.create({
                    data: {
                        category: currentCategory,
                        name: islem.trim(),
                        listPrice,
                        campaignPrice
                    }
                });
                console.log(`Imported: [${currentCategory}] ${islem.trim()} (List: ${listPrice}, Camp: ${campaignPrice})`);
            }
        }
        console.log("Import successfully completed.");
    } catch (e) {
        console.error("Error during import:", e);
    } finally {
        await prisma.$disconnect();
    }
}

importExcel();
