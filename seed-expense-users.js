const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const defaultPassword = await bcrypt.hash('123456', 10);

    // 1. Create a Manager
    const manager = await prisma.user.upsert({
        where: { email: 'manager@sirket.com' },
        update: { role: 'MANAGER', name: 'Ahmet Müdür' },
        create: {
            email: 'manager@sirket.com',
            password: defaultPassword,
            name: 'Ahmet Müdür',
            role: 'MANAGER',
        },
    });
    console.log('Manager created:', manager.email);

    // 2. Create Accounting
    const accounting = await prisma.user.upsert({
        where: { email: 'muhasebe@sirket.com' },
        update: { role: 'ACCOUNTING', name: 'Ayşe Muhasebe' },
        create: {
            email: 'muhasebe@sirket.com',
            password: defaultPassword,
            name: 'Ayşe Muhasebe',
            role: 'ACCOUNTING',
        },
    });
    console.log('Accounting created:', accounting.email);

    // 3. Create a plain User reporting to Manager
    const user1 = await prisma.user.upsert({
        where: { email: 'personel1@sirket.com' },
        update: { managerId: manager.id, name: 'Canan Personel', role: 'USER' },
        create: {
            email: 'personel1@sirket.com',
            password: defaultPassword,
            name: 'Canan Personel',
            role: 'USER',
            managerId: manager.id,
        },
    });
    console.log('User created:', user1.email);

    // Also link the main admin to the manager just in case the admin wants to test submitting a form
    await prisma.user.updateMany({
        where: { email: 'ugurozan@gmail.com' },
        data: { managerId: manager.id, name: 'Uğur Ozan' }
    });
    console.log('Admin linked to manager');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
