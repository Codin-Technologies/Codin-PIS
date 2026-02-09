import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session');
    const { pathname } = request.nextUrl;

    // 1. Redirect to login if NOT logged in and trying to access dashboard
    if (!session && pathname !== '/login' && !pathname.startsWith('/_next') && !pathname.includes('.')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Redirect to home if logged in and trying to access login page
    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
