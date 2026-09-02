import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt } from 'jose';

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
        const payload = decodeJwt(siteAccessCookie);
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
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
