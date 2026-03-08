const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');

async function main() {
    const sqliteDb = new Database('./prisma/whatsapp_crm.db');
    const prisma = new PrismaClient();

    console.log('Connecting to SQLite and Postgres...');

    // 1. CHATS
    const chats = sqliteDb.prepare('SELECT * FROM chats').all();
    console.log(`Migrating ${chats.length} chats...`);

    // Create chunks of 100 to avoid overloading the pool
    for (let i = 0; i < chats.length; i += 100) {
        const chunk = chats.slice(i, i + 100);
        await prisma.chat.createMany({
            data: chunk,
            skipDuplicates: true
        });
    }

    // 2. CRM INSIGHTS
    const insights = sqliteDb.prepare('SELECT * FROM crm_insights').all();
    console.log(`Migrating ${insights.length} insights...`);
    for (let i = 0; i < insights.length; i += 100) {
        const chunk = insights.slice(i, i + 100);
        await prisma.crmInsight.createMany({
            data: chunk,
            skipDuplicates: true
        });
    }

    // 3. MESSAGES
    const messages = sqliteDb.prepare('SELECT * FROM messages').all();
    console.log(`Migrating ${messages.length} messages...`);
    for (let i = 0; i < messages.length; i += 500) {
        const chunk = messages.slice(i, i + 500);
        await prisma.message.createMany({
            data: chunk,
            skipDuplicates: true
        });
    }

    console.log('Migration complete!');
    sqliteDb.close();
    await prisma.$disconnect();
}

main().catch(e => console.error('Error during migration:', e));
