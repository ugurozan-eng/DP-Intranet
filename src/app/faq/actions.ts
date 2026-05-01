"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";

export async function addFaq(data: { question: string, answer: string }) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    const nextOrder = await prisma.faq.count();
    await prisma.faq.create({
        data: {
            ...data,
            order: nextOrder
        }
    });
    revalidatePath('/faq');
}

export async function updateFaq(id: string, data: { question?: string, answer?: string }) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    await prisma.faq.update({
        where: { id },
        data
    });
    revalidatePath('/faq');
}

export async function deleteFaq(id: string) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    await prisma.faq.delete({ where: { id } });
    revalidatePath('/faq');
}

export async function updateFaqOrders(updates: { id: string, order: number }[]) {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");
    await prisma.$transaction(
        updates.map(u => 
            prisma.faq.update({
                where: { id: u.id },
                data: { order: u.order }
            })
        )
    );
    revalidatePath('/faq');
}
