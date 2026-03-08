const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const insights = await prisma.crmInsight.findMany({
        where: {
            products_mentioned: { not: null },
            prices_mentioned: { not: null }
        },
        take: 10
    });
    console.log(insights.map(i => ({ p: i.products_mentioned, pr: i.prices_mentioned })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
