import {NextRequest, NextResponse} from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = new Set(['/dashboard', '/loans', '/users']);

export async function middleware(req: NextRequest) {
    const {pathname} = req.nextUrl;

    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const isLoggedIn = !!token;

    if (pathname === '/') {
        const redirectPath = isLoggedIn ? '/dashboard' : '/books';
        return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    if (!isLoggedIn && protectedRoutes.has(pathname)) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/dashboard', '/loans', '/users'],
};
