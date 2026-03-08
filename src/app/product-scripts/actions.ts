"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addScript(data: { name: string, content: string }) {
    await prisma.script.create({
        data: {
            type: "Bilgi",
            ...data
        }
    });
    revalidatePath("/product-scripts");
}

export async function deleteScript(id: string) {
    await prisma.script.delete({
        where: { id }
    });
    revalidatePath("/product-scripts");
}

export async function updateScript(id: string, data: { name?: string, content?: string }) {
    await prisma.script.update({
        where: { id },
        data
    });
    revalidatePath("/product-scripts");
}
