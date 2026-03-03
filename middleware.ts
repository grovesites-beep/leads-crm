import { NextRequest, NextResponse } from 'next/server';

// Rotas públicas que não precisam de autenticação
const ROTAS_PUBLICAS = ['/login', '/api/webhook'];

/**
 * Middleware de autenticação e controle de acesso
 * Redireciona usuários não autenticados para /login
 * A verificação de role é feita nas Server Actions depois do login
 */
export function middleware(requisicao: NextRequest) {
    const { pathname } = requisicao.nextUrl;
    const cookieSessao = requisicao.cookies.get('sessao-appwrite');

    // Permite acesso a rotas públicas
    const ehRotaPublica = ROTAS_PUBLICAS.some(rota => pathname.startsWith(rota));
    if (ehRotaPublica) {
        // Se já está autenticado e tenta acessar /login, redireciona para /dashboard
        if (cookieSessao?.value && pathname === '/login') {
            return NextResponse.redirect(new URL('/dashboard', requisicao.url));
        }
        return NextResponse.next();
    }

    // Redireciona para login se não há sessão
    if (!cookieSessao?.value) {
        const urlLogin = new URL('/login', requisicao.url);
        urlLogin.searchParams.set('redirecionamento', pathname);
        return NextResponse.redirect(urlLogin);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
