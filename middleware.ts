import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE } from './src/lib/appwrite/auth';

export function middleware(request: NextRequest) {
    const session = request.cookies.get(SESSION_COOKIE);

    // Se tentar acessar o dashboard sem sessão, vai para o login
    if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Se já estiver logado e tentar ir para o login ou home, vai para o dashboard
    if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/'],
};
