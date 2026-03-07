"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addService(data: { category: string, name: string, listPrice: number, campaignPrice: number }) {
    await prisma.service.create({
        data
    });
    revalidatePath("/services");
}

export async function deleteService(id: string) {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/services");
}
