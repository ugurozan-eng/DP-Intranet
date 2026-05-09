const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = ['busra@dp.com', 'naz@dp.com'];
  
  for (const email of users) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { email },
        data: {
          allowedDepartments: ['KLINIK', 'GUZELLIK']
        }
      });
      console.log(`Updated user ${email}`);
    } else {
      console.log(`User ${email} not found`);
    }
  }
  
  // Special case for ugurozan@gmail.com (though handled in code, good to have in DB too)
  const admin = await prisma.user.findUnique({ where: { email: 'ugurozan@gmail.com' } });
  if (admin) {
    await prisma.user.update({
      where: { email: 'ugurozan@gmail.com' },
      data: {
        allowedDepartments: ['KLINIK', 'GUZELLIK']
      }
    });
    console.log(`Updated admin ugurozan@gmail.com`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
