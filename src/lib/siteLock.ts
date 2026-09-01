"use server";

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';
import { getUser } from './auth';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-for-dilan-polat';
const key = new TextEncoder().encode(secretKey + '-site-lock');

export async function getSitePassword(): Promise<string> {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'SITE_PASSWORD' }
        });
        if (setting?.value) return setting.value;
    } catch {
        // Fallback if db unavailable during build
    }
    return process.env.SITE_PASSWORD || 'dp2026';
}

export async function encryptSiteAccess() {
    return await new SignJWT({ siteUnlocked: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function verifySiteAccess(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload?.siteUnlocked === true;
    } catch {
        return false;
    }
}

export async function unlockSite(password: string) {
    const expectedPassword = await getSitePassword();
    if (password !== expectedPassword) {
        return { error: 'Girdiğiniz site giriş şifresi hatalıdır.' };
    }

    const token = await encryptSiteAccess();
    const cookieStore = await cookies();
    cookieStore.set('site_access', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
        // Omitted maxAge makes this a browser Session Cookie (expires on browser close)
    });

    return { success: true };
}

export async function lockSite() {
    const cookieStore = await cookies();
    cookieStore.delete('site_access');
    redirect('/unlock');
}

export async function updateSitePassword(newPassword: string) {
    const user = await getUser();
    if (!user || user.role !== 'ADMIN') {
        return { error: 'Bu işlemi yapmaya yetkiniz yok.' };
    }

    if (!newPassword || newPassword.trim().length < 3) {
        return { error: 'Şifre en az 3 karakter olmalıdır.' };
    }

    const trimmed = newPassword.trim();
    await prisma.systemSetting.upsert({
        where: { key: 'SITE_PASSWORD' },
        update: { value: trimmed },
        create: { key: 'SITE_PASSWORD', value: trimmed }
    });

    return { success: true };
}
