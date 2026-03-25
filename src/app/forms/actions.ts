"use server";

import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createExpense(data: { category: string, amount: number, description: string, date: Date }) {
    const user = await getUser();
    if (!user) throw new Error("Üyelik girişi yapılmadı.");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    await prisma.expense.create({
        data: {
            ...data,
            userId: user.id,
            managerId: dbUser?.managerId,
            status: "PENDING_MANAGER",
        }
    });
    revalidatePath("/forms");
}

export async function approveByManager(id: string) {
    const user = await getUser();
    if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') throw new Error("Yetkisiz işlem");

    await prisma.expense.update({
        where: { id },
        data: { status: "PENDING_ACCOUNTING" }
    });
    revalidatePath("/forms");
}

export async function approveByAccounting(id: string) {
    const user = await getUser();
    if (user?.role !== 'ACCOUNTING' && user?.role !== 'ADMIN') throw new Error("Yetkisiz işlem");

    await prisma.expense.update({
        where: { id },
        data: { status: "COMPLETED" }
    });
    revalidatePath("/forms");
}

export async function rejectExpense(id: string) {
    const user = await getUser();
    if (!user) throw new Error("Yetkisiz işlem");

    await prisma.expense.update({
        where: { id },
        data: { status: "REJECTED" }
    });
    revalidatePath("/forms");
}

export async function deleteExpense(id: string) {
    const user = await getUser();
    if (!user) throw new Error("Yetkisiz");
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/forms");
}
