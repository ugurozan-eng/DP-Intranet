"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addScript(data: { name: string, content: string, department?: string }) {
    await prisma.script.create({
        data: {
            type: "Bilgi",
            ...data,
            department: data.department || 'KLINIK'
        }
    });
    revalidatePath("/product-scripts");
}

export async function deleteScript(id: string, department: string) {
    await prisma.script.deleteMany({
        where: { id, department }
    });
    revalidatePath("/product-scripts");
}

export async function updateScript(id: string, data: { name?: string, content?: string }, department?: string) {
    if (department) {
        const record = await prisma.script.findFirst({ where: { id, department } });
        if (!record) return;
    }
    await prisma.script.update({
        where: { id },
        data
    });
    revalidatePath("/product-scripts");
}
