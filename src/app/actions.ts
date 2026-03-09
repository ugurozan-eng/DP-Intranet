"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addAnnouncement(data: { title: string, content: string }) {
    await prisma.announcement.create({
        data
    });
    revalidatePath("/");
}

export async function deleteAnnouncement(id: string) {
    await prisma.announcement.delete({
        where: { id }
    });
    revalidatePath("/");
}
