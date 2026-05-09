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

export async function deleteAnnouncement(id: string) {
    await prisma.announcement.delete({
        where: { id }
    });
    revalidatePath("/");
}

export async function updateAnnouncement(id: string, data: { title: string, content: string }) {
    await prisma.announcement.update({
        where: { id },
        data
    });
    revalidatePath("/");
}

