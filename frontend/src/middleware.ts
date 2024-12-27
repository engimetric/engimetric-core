import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('authToken');

    const protectedRoutes = ['/dashboard', '/settings', '/billing', '/members', '/team'];

    if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route)) && !token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}
