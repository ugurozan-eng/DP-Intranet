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

export async function updateServicePrice(id: string, type: 'listPrice' | 'campaignPrice', value: number) {
    await prisma.service.update({
        where: { id },
        data: {
            [type]: value
        }
    });
    revalidatePath("/services");
}

export async function updateServiceName(id: string, name: string) {
    await prisma.service.update({
        where: { id },
        data: { name }
    });
    revalidatePath("/services");
}
