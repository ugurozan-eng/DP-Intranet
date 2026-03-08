"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addEmployee(data: { name: string, department: string, startDate: string, photoBase64: string | null }) {
    await prisma.employee.create({
        data
    });
    revalidatePath("/employees");
}

export async function deleteEmployee(id: string) {
    await prisma.employee.delete({
        where: { id }
    });
    revalidatePath("/employees");
}
