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

export async function addQuickReply(data: { title: string, content: string, category: string }) {
    await prisma.quickReply.create({
        data
    });
    revalidatePath("/scripts");
}

export async function deleteQuickReply(id: string) {
    await prisma.quickReply.delete({ where: { id } });
    revalidatePath("/scripts");
}

export async function updateQuickReply(id: string, data: Partial<{ title: string, content: string, category: string }>) {
    await prisma.quickReply.update({
        where: { id },
        data
    });
    revalidatePath("/scripts");
}

export async function addCategory(name: string) {
    const nextOrder = await prisma.quickReplyCategory.count();
    await prisma.quickReplyCategory.create({ data: { name, order: nextOrder }});
    revalidatePath("/scripts");
}

export async function updateCategory(id: string, newName: string) {
    const cat = await prisma.quickReplyCategory.findUnique({ where: { id }});
    if (!cat) return;

    await prisma.$transaction([
        prisma.quickReplyCategory.update({ where: { id }, data: { name: newName } }),
        prisma.quickReply.updateMany({ where: { category: cat.name }, data: { category: newName } })
    ]);
    revalidatePath("/scripts");
}

export async function deleteCategory(id: string) {
    const cat = await prisma.quickReplyCategory.findUnique({ where: { id }});
    if (!cat) return;

    await prisma.$transaction([
        prisma.quickReply.updateMany({ where: { category: cat.name }, data: { category: "Diğer" } }),
        prisma.quickReplyCategory.delete({ where: { id } })
    ]);
    revalidatePath("/scripts");
}
