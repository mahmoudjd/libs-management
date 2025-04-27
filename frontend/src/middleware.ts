import {NextRequest, NextResponse} from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = ['/dashboard', '/loans' ,'/users'];
const unprotectedRoutes = ['/login', '/register', '/books'];

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (token && !protectedRoutes.includes(req.nextUrl.pathname) && !unprotectedRoutes.includes(req.nextUrl.pathname)) {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    if (!token && protectedRoutes.includes(req.nextUrl.pathname)) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard', '/loans', '/users'],
};
