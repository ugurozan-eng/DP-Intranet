"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addService(data: { category: string, name: string, listPrice: number, campaignPrice: number, department?: string }) {
    await prisma.service.create({
        data: {
            ...data,
            department: data.department || 'KLINIK'
        }
    });
    revalidatePath("/services");
}

export async function deleteService(id: string, department: string) {
    await prisma.service.deleteMany({ where: { id, department } });
    revalidatePath("/services");
}

export async function updateServicePrice(id: string, type: 'listPrice' | 'campaignPrice', value: number, department?: string) {
    if (department) {
        const record = await prisma.service.findFirst({ where: { id, department } });
        if (!record) return;
    }
    await prisma.service.update({
        where: { id },
        data: {
            [type]: value
        }
    });
    revalidatePath("/services");
}

export async function updateServiceName(id: string, name: string, department?: string) {
    if (department) {
        const record = await prisma.service.findFirst({ where: { id, department } });
        if (!record) return;
    }
    await prisma.service.update({
        where: { id },
        data: { name }
    });
    revalidatePath("/services");
}
