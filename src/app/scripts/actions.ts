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

export async function addQuickReply(data: { title: string, content: string, category: string, topic?: string, department?: string }) {
    await prisma.quickReply.create({
        data: {
            ...data,
            department: data.department || 'KLINIK'
        }
    });
    revalidatePath("/scripts");
}

export async function deleteQuickReply(id: string, department: string) {
    await prisma.quickReply.deleteMany({ where: { id, department } });
    revalidatePath("/scripts");
}

export async function updateQuickReply(id: string, data: Partial<{ title: string, content: string, category: string, topic: string, isArchived: boolean }>, department?: string) {
    if (department) {
        // Verify the record belongs to the expected department before updating
        const record = await prisma.quickReply.findFirst({ where: { id, department } });
        if (!record) return;
    }
    await prisma.quickReply.update({
        where: { id },
        data
    });
    revalidatePath("/scripts");
}

export async function addCategory(name: string, department?: string) {
    const dept = department || 'KLINIK';
    const nextOrder = await prisma.quickReplyCategory.count({ where: { department: dept } });
    await prisma.quickReplyCategory.create({ data: { name, order: nextOrder, department: dept }});
    revalidatePath("/scripts");
}

export async function updateCategory(id: string, newName: string, department?: string) {
    const cat = await prisma.quickReplyCategory.findFirst({ where: { id, ...(department ? { department } : {}) }});
    if (!cat) return;

    await prisma.$transaction([
        prisma.quickReplyCategory.update({ where: { id }, data: { name: newName } }),
        prisma.quickReply.updateMany({ 
            where: { 
                category: cat.name,
                department: cat.department
            }, 
            data: { category: newName } 
        })
    ]);
    revalidatePath("/scripts");
}

export async function deleteCategory(id: string, department?: string) {
    const cat = await prisma.quickReplyCategory.findFirst({ where: { id, ...(department ? { department } : {}) }});
    if (!cat) return;

    await prisma.$transaction([
        prisma.quickReply.updateMany({ 
            where: { 
                category: cat.name,
                department: cat.department
            }, 
            data: { category: "Diğer" } 
        }),
        prisma.quickReplyCategory.delete({ where: { id } })
    ]);
    revalidatePath("/scripts");
}

export async function updateCategoryOrders(updates: { id: string, order: number }[]) {
    await prisma.$transaction(
        updates.map(u => 
            prisma.quickReplyCategory.update({
                where: { id: u.id },
                data: { order: u.order }
            })
        )
    );
    revalidatePath("/scripts");
}

export async function updateQuickReplyOrders(updates: { id: string, order: number }[]) {
    await prisma.$transaction(
        updates.map(u => 
            prisma.quickReply.update({
                where: { id: u.id },
                data: { order: u.order }
            })
        )
    );
    revalidatePath("/scripts");
}
