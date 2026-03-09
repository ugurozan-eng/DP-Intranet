const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Initial Admin user...");

    const email = "ugurozan@gmail.com";
    const password = await bcrypt.hash("123456", 10);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        await prisma.user.create({
            data: {
                email,
                password,
                role: "ADMIN"
            }
        });
        console.log("Admin user created.");
    } else {
        console.log("Admin user already exists.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
