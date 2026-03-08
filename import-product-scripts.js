const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function importScripts() {
    console.log("Starting scripts excel import...");
    try {
        await prisma.script.deleteMany(); // Clear existing
        console.log("Existing scripts cleared.");

        const file = "C:\\Claude Projects\\intranet\\web\\urun_scriptleri.xlsx";
        const wb = xlsx.readFile(file);
        const sheetName = wb.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

        // Loop over the rows, skipping the first row if it's the inner header
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const keys = Object.keys(row);

            if (keys.length < 2) continue;

            const name = String(row[keys[0]]).trim();
            const content = String(row[keys[1]]).trim();

            if (!name || name === 'İşlem' || name === 'Standart Scriptler') continue;
            if (!content || content === 'Bilgilendirme/Satış Scripti') continue;

            await prisma.script.create({
                data: {
                    type: "Bilgi", // generic fallback
                    name: name,
                    content: content
                }
            });
            console.log(`Imported Script: ${name}`);
        }
        console.log("Script Import successfully completed.");
    } catch (e) {
        console.error("Error during scripts import:", e);
    } finally {
        await prisma.$disconnect();
    }
}

importScripts();
