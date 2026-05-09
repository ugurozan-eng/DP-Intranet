import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-for-dilan-polat';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
    });
    return payload;
}

import { prisma } from './prisma';

export async function getUser() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    try {
        const parsed = await decrypt(session);
        return parsed as { id: string, email: string, role: string };
    } catch {
        return null;
    }
}

export async function checkDepartmentAccess(dept: string) {
    const user = await getUser();
    if (!user) return true; // Default allow for guest (read-only usually)
    
    if (user.email === 'ugurozan@gmail.com') return true;
    
    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!dbUser) return false;
    
    // If no restrictions set, allow all for now to avoid breaking existing users
    if (!dbUser.allowedDepartments || dbUser.allowedDepartments.length === 0) return true;
    
    return dbUser.allowedDepartments.includes(dept);
}
