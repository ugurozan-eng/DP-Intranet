"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createLeave(data: { type: string, startDate: Date, endDate: Date, description: string }) {
    const user = await getUser();
    if (!user) throw new Error("Üyelik girişi yapılmadı.");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    await prisma.leave.create({
        data: {
            ...data,
            userId: user.id,
            managerId: dbUser?.managerId,
            status: "PENDING_MANAGER",
        }
    });
    revalidatePath("/leaves");
}

export async function approveLeaveManager(id: string) {
    const user = await getUser();
    if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') throw new Error("Yetkisiz işlem");

    await prisma.leave.update({
        where: { id },
        data: { status: "PENDING_ACCOUNTING" }
    });
    revalidatePath("/leaves");
}

export async function approveLeaveAccounting(id: string) {
    const user = await getUser();
    if (user?.role !== 'ACCOUNTING' && user?.role !== 'ADMIN') throw new Error("Yetkisiz işlem");

    await prisma.leave.update({
        where: { id },
        data: { status: "COMPLETED" }
    });
    revalidatePath("/leaves");
}

export async function rejectLeave(id: string) {
    const user = await getUser();
    if (!user) throw new Error("Yetkisiz işlem");

    await prisma.leave.update({
        where: { id },
        data: { status: "REJECTED" }
    });
    revalidatePath("/leaves");
}

export async function deleteLeave(id: string) {
    const user = await getUser();
    if (!user) throw new Error("Yetkisiz");
    await prisma.leave.delete({ where: { id } });
    revalidatePath("/leaves");
}
