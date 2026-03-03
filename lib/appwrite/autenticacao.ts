import { cookies } from 'next/headers';
import { criarClienteComSessao, criarClienteServidor } from './servidor';

// Nome do cookie da sessão do Appwrite
export const NOME_COOKIE_SESSAO = 'sessao-appwrite';

/**
 * Obtém o usuário autenticado atual via cookie de sessão
 * Retorna null se não houver sessão válida
 */
export async function obterUsuarioAtual() {
    try {
        const lojaCookies = await cookies();
        const sessao = lojaCookies.get(NOME_COOKIE_SESSAO);

        if (!sessao || !sessao.value) {
            return null;
        }

        const { conta } = criarClienteComSessao(sessao.value);
        const usuario = await conta.get();
        return usuario;
    } catch {
        return null;
    }
}

/**
 * Verifica se o usuário é administrador
 * Retorna verdadeiro se o usuário tiver a label 'admin' ou o e-mail for o admin principal
 */
export async function verificarSeEhAdmin(usuario: { labels?: string[]; email?: string } | null): Promise<boolean> {
    if (!usuario) return false;

    const emailAdmin = process.env.ADMIN_EMAIL || 'nei@grovehub.com.br';
    const temLabelAdmin = Array.isArray(usuario.labels) && usuario.labels.includes('admin');
    const ehEmailAdmin = usuario.email === emailAdmin;

    return temLabelAdmin || ehEmailAdmin;
}

/**
 * Cria a sessão do usuário após login e armazena o cookie
 */
export async function criarSessao(email: string, senha: string) {
    const { conta } = criarClienteServidor();

    const sessao = await conta.createEmailPasswordSession(email, senha);

    const lojaCookies = await cookies();
    lojaCookies.set(NOME_COOKIE_SESSAO, sessao.secret, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return sessao;
}

/**
 * Remove a sessão do usuário e deleta o cookie
 */
export async function encerrarSessao() {
    try {
        const lojaCookies = await cookies();
        const sessao = lojaCookies.get(NOME_COOKIE_SESSAO);

        if (sessao?.value) {
            const { conta } = criarClienteComSessao(sessao.value);
            await conta.deleteSession('current');
        }
    } catch {
        // Ignora erros ao encerrar sessão
    } finally {
        const lojaCookies = await cookies();
        lojaCookies.delete(NOME_COOKIE_SESSAO);
    }
}
