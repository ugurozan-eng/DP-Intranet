"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function ensureAnalyticsTables() {
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

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "UserActivity" (
                "id" TEXT PRIMARY KEY,
                "userEmail" TEXT NOT NULL DEFAULT 'Misafir / Giriş Yapmamış',
                "pageViews" INTEGER DEFAULT 0,
                "copies" INTEGER DEFAULT 0,
                "department" TEXT DEFAULT 'GENEL',
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
        `);
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UserActivity_userEmail_department_key" ON "UserActivity"("userEmail", "department");
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

    let userEmail = "Misafir / Giriş Yapmamış";
    try {
        const user = await getUser();
        if (user && user.email) {
            userEmail = user.email;
        }
    } catch {}

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

        await prisma.userActivity.upsert({
            where: {
                userEmail_department: {
                    userEmail,
                    department
                }
            },
            update: {
                pageViews: { increment: 1 }
            },
            create: {
                userEmail,
                department,
                pageViews: 1,
                copies: 0
            }
        });
    } catch (e) {
        try {
            await ensureAnalyticsTables();
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

            await prisma.userActivity.upsert({
                where: {
                    userEmail_department: {
                        userEmail,
                        department
                    }
                },
                update: {
                    pageViews: { increment: 1 }
                },
                create: {
                    userEmail,
                    department,
                    pageViews: 1,
                    copies: 0
                }
            });
        } catch (err) {
            // Silently ignore to guarantee zero impact on user experience
        }
    }
}

export async function recordUserCopy(department?: string) {
    const dept = (department && ["KLINIK", "GUZELLIK", "DENTAL"].includes(department)) ? department : "GENEL";
    let userEmail = "Misafir / Giriş Yapmamış";
    try {
        const user = await getUser();
        if (user && user.email) {
            userEmail = user.email;
        }
    } catch {}

    try {
        await prisma.userActivity.upsert({
            where: {
                userEmail_department: {
                    userEmail,
                    department: dept
                }
            },
            update: {
                copies: { increment: 1 }
            },
            create: {
                userEmail,
                department: dept,
                pageViews: 0,
                copies: 1
            }
        });
    } catch (e) {
        try {
            await ensureAnalyticsTables();
            await prisma.userActivity.upsert({
                where: {
                    userEmail_department: {
                        userEmail,
                        department: dept
                    }
                },
                update: {
                    copies: { increment: 1 }
                },
                create: {
                    userEmail,
                    department: dept,
                    pageViews: 0,
                    copies: 1
                }
            });
        } catch (err) {
            // Silently ignore
        }
    }
}
