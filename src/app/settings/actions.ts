"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!email || !password || !role) {
        return { error: "Lütfen tüm alanları doldurun." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return { error: "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role,
        }
    });

    revalidatePath("/settings");
    return { success: true };
}

export async function deleteUser(id: string) {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/settings");
}
