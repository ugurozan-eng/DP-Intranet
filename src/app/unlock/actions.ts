"use server";

import { unlockSite } from "@/lib/siteLock";

export async function submitUnlock(password: string) {
    return await unlockSite(password);
}
