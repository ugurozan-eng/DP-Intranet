const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const content = `🌸 8 Mart Kadınlar Günü kampanyamız:
 
1 ml Elasty marka dolgu ve 5 Bölge Dysport marka Botoks sadece 7990 TL.Buna 2 seans Kleopatra aşısı hediyedir

Kampanyadaki hizmetlerden tek tek faydalanılmak istenirse

1 ml elsaty dolgu 4.290 TL (1 seans hediye kleopatra aşısı)
5 Bölge Botoks 4.290 TL (1 seans hediye kleopatra aşısı)
3 Bölge Botoks 3.750 TL'dir .

✅Diğer hizmetlerimizin Mart ayı  kampanya fiyatları:

•  PRP  3 seans : 5.990 TL
• Mezoterapi 3 seans : 5.990 TL
•  Çene ucu dolgusu (3 cc): 7.500 TL
•  Jawline dolgu 10 ml (çene hattı): 17.990TL
• Fox Eyes 4 İp 9.990 TL
Fransız İp askı 4 İp  10.000 TL

Hizmetlerimizin kampanyasız fiyatları
• 1 ML Elasty Dolgu liste fiyatımız 4.500 TL
• 5 Bölge Dysport Botoks liste fiyatımız 4.500 TL
• Kleopatra aşısı tek seans 3.500 TL
•  Jawline dolgu (çene hattı): 25.000 TL
•  Fox Eyes 4 İp 14.000 TL

Kampanya Mart sonuna kadar geçerlidir.

Danışanlara çağrı merkezinde söylenecek script:

Merhaba,
Özel Dilan Polat Kliniğinden Çağla ben.
🌸 8 Mart Kadınlar Günü kampanyamızda 1 ml Elasty marka dolgu ve 5 Bölge Dysport marka Botoks sadece 7990 TL.Buna 2 seans Kleopatra aşısı hediye efendim.😊

Kampanyadaki hizmetlerden tek tek faydalanmak isterseniz:
1 ml elsaty dolgu 4.290 TL (1 seans hediye kleopatra aşısı)
5 Bölge Botoks 4.290 TL (1 seans hediye kleopatra aşısı)
3 Bölge Botoks 3.750 TL'dir efendim. 

Kampanyamız Mart sonuna kadar geçerlidir.

Önemli Not: * Kampanya dahilinde yapılan tahsilatların iadesi bulunmamaktadır.
Kullanılmamış hizmetler bir başkasına devredilebilir.`;

async function main() {
    await prisma.announcement.deleteMany(); // Clear existing
    await prisma.announcement.create({
        data: {
            title: "Mart Kampanyası (Şirket İçi Bilgilendirme)",
            content: content
        }
    });
    console.log("Seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
