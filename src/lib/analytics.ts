"use server";

import { prisma } from "@/lib/prisma";

export async function ensurePageViewTable() {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "PageView" (
                "id" TEXT PRIMARY KEY,
                "path" TEXT NOT NULL,
                "department" TEXT DEFAULT 'GENEL',
                "count" INTEGER DEFAULT 1,
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
        `);
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "PageView_path_department_key" ON "PageView"("path", "department");
        `);
    } catch (e) {
        // Ignore if already exists
    }
}

export async function recordPageView(rawPath: string, rawDept?: string | null) {
    if (!rawPath || rawPath.startsWith("/api") || rawPath.startsWith("/_next") || rawPath.startsWith("/unlock") || rawPath.startsWith("/login")) {
        return;
    }

    const path = rawPath.split("?")[0] || "/";
    const department = (rawDept && ["KLINIK", "GUZELLIK", "DENTAL"].includes(rawDept)) ? rawDept : "GENEL";

    try {
        await prisma.pageView.upsert({
            where: {
                path_department: {
                    path,
                    department
                }
            },
            update: {
                count: { increment: 1 }
            },
            create: {
                path,
                department,
                count: 1
            }
        });
    } catch (e) {
        try {
            await ensurePageViewTable();
            await prisma.pageView.upsert({
                where: {
                    path_department: {
                        path,
                        department
                    }
                },
                update: {
                    count: { increment: 1 }
                },
                create: {
                    path,
                    department,
                    count: 1
                }
            });
        } catch (err) {
            // Silently ignore to guarantee zero impact on user experience
        }
    }
}
