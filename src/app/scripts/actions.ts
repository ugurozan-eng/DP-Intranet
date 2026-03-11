"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addScript(data: { type: string, name: string, content: string }) {
    await prisma.script.create({
        data
    });
    revalidatePath("/scripts");
}

export async function deleteScript(id: string) {
    await prisma.script.delete({ where: { id } });
    revalidatePath("/scripts");
}

export async function addQuickReply(data: { title: string, content: string }) {
    await prisma.quickReply.create({
        data
    });
    revalidatePath("/scripts");
}

export async function deleteQuickReply(id: string) {
    await prisma.quickReply.delete({ where: { id } });
    revalidatePath("/scripts");
}

export async function updateQuickReply(id: string, data: Partial<{ title: string, content: string }>) {
    await prisma.quickReply.update({
        where: { id },
        data
    });
    revalidatePath("/scripts");
}
