const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const repliesWithCopies = await prisma.quickReply.findMany({
    where: { copyCount: { gt: 0 } },
    select: { id: true, title: true, copyCount: true, department: true, category: true }
  });
  console.log('--- QuickReplies with copyCount > 0 ---');
  console.log(JSON.stringify(repliesWithCopies, null, 2));

  const totalCopies = await prisma.quickReply.aggregate({
    _sum: { copyCount: true }
  });
  console.log('--- Total QuickReply Copies in DB ---', totalCopies);

  const activities = await prisma.userActivity.findMany();
  console.log('--- UserActivity rows ---');
  console.log(JSON.stringify(activities, null, 2));

  const pageViews = await prisma.pageView.findMany();
  console.log('--- PageViews ---');
  console.log(JSON.stringify(pageViews, null, 2));

  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log('--- All Users in DB ---');
  console.log(JSON.stringify(allUsers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
