const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Adding missing info for Sıvı Yüz germe...");
    try {
        const fullContent = `✅ Novuma – 25.000 TL
Cildi sıkılaştırır, yeniler ve daha genç görünüm sağlar.

✅ PLLA – 22.000 TL
Kolajen üretimini artırır. Yüzü zamanla doğal şekilde toparlar.

✅ DP Lift – 20.000 TL
Özel akıllı dolgu. Nem verir, dolgunluk sağlar ve kırışıklıkları azaltır.

📌 Hepsi ameliyatsız işlemdir.
📌 Uygulama seçimi yüz yapınıza göre belirlenir.`;

        // Let's delete the old one "Sıvı Yüz germe diğer işlemler" first.
        const deleted = await prisma.script.deleteMany({
            where: {
                name: "Sıvı Yüz germe diğer işlemler"
            }
        });
        console.log("Deleted old incomplete script:", deleted.count);

        await prisma.script.create({
            data: {
                type: "Bilgi",
                name: "Sıvı Yüz germe diğer işlemler",
                content: fullContent
            }
        });

        console.log("Successfully added the complete script!");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
