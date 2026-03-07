"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resolveConflict(chatId: string, resolvedPrice: string) {
    try {
        await prisma.crmInsight.update({
            where: {
                chat_id: chatId,
            },
            data: {
                prices_mentioned: JSON.stringify([resolvedPrice]),
            },
        });

        revalidatePath("/conflicts");
        return { success: true };
    } catch (error) {
        console.error("Failed to resolve conflict:", error);
        return { success: false, error: "Failed to resolve conflict" };
    }
}
