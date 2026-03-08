const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.employee.deleteMany(); // Clear existing
    await prisma.employee.create({
        data: {
            name: "Esma Sevinç Eravcı",
            department: "Klinik / İdari Müdür",
            startDate: "04.01.2026",
            photoBase64: "/team/esma.png"
        }
    });
    console.log("Seeded successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
