"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addFaq(data: { question: string, answer: string }) {
    await prisma.faq.create({
        data
    });
    revalidatePath("/faqs");
}

export async function deleteFaq(id: string) {
    await prisma.faq.delete({ where: { id } });
    revalidatePath("/faqs");
}
