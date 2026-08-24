import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-for-dilan-polat';
const key = new TextEncoder().encode(secretKey + '-site-lock');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public assets, Next.js system routes, and the unlock page
    if (
        pathname.startsWith('/_next') ||
        pathname === '/unlock' ||
        pathname.startsWith('/api/unlock') ||
        pathname === '/favicon.ico' ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.ico')
    ) {
        return NextResponse.next();
    }

    const siteAccessCookie = request.cookies.get('site_access')?.value;

    if (!siteAccessCookie) {
        const url = request.nextUrl.clone();
        url.pathname = '/unlock';
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    try {
        const { payload } = await jwtVerify(siteAccessCookie, key, {
            algorithms: ['HS256'],
        });

        if (payload?.siteUnlocked !== true) {
            throw new Error('Invalid token');
        }
    } catch {
        const url = request.nextUrl.clone();
        url.pathname = '/unlock';
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for _next/static, _next/image, and favicon.ico
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
