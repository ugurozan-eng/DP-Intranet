"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addAnnouncement(data: { title: string, content: string, department?: string }) {
    await prisma.announcement.create({
        data: {
            title: data.title,
            content: data.content,
            department: data.department || 'KLINIK'
        }
    });
    revalidatePath("/");
}

export async function deleteAnnouncement(id: string, department: string) {
    await prisma.announcement.deleteMany({
        where: { id, department }
    });
    revalidatePath("/");
}

export async function updateAnnouncement(id: string, data: { title: string, content: string }, department?: string) {
    if (department) {
        const record = await prisma.announcement.findFirst({ where: { id, department } });
        if (!record) return;
    }
    await prisma.announcement.update({
        where: { id },
        data
    });
    revalidatePath("/");
}

