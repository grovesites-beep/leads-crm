import { NextRequest, NextResponse } from 'next/server';
import { Client, Account } from 'node-appwrite';
import { cookies } from 'next/headers';

/**
 * API Route: Proxy de login server-side
 * POST /api/autenticar
 *
 * O login é feito do SERVIDOR para o Appwrite, não do browser.
 * Isso elimina completamente a necessidade de plataforma Web cadastrada no Appwrite,
 * pois CORS não se aplica a requisições servidor-para-servidor.
 */
export async function POST(req: NextRequest) {
    try {
        const { email, senha } = await req.json();

        if (!email || !senha) {
            return NextResponse.json(
                { sucesso: false, erro: 'E-mail e senha são obrigatórios.' },
                { status: 400 }
            );
        }

        // Cria um cliente público (sem API Key) — a sessão é do usuário, não do admin
        const cliente = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

        const conta = new Account(cliente);

        // Cria a sessão no servidor (evita CORS do browser)
        const sessao = await conta.createEmailPasswordSession(email, senha);

        // Obtém o usuário para verificar o papel (role)
        const clienteComSessao = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
            .setSession(sessao.secret);

        const contaComSessao = new Account(clienteComSessao);
        const usuario = await contaComSessao.get();

        // Define o papel: admin ou cliente
        const emailAdmin = process.env.ADMIN_EMAIL || 'nei@grovehub.com.br';
        const ehAdmin = (Array.isArray(usuario.labels) && usuario.labels.includes('admin')) ||
            usuario.email === emailAdmin;

        // Armazena o cookie de sessão de forma segura (httpOnly)
        const lojaCookies = await cookies();
        lojaCookies.set('sessao-appwrite', sessao.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 dias
        });

        return NextResponse.json({
            sucesso: true,
            redirecionarPara: ehAdmin ? '/admin' : '/dashboard',
        });

    } catch (erro: unknown) {
        console.error('[/api/autenticar]', erro);

        const msg = erro instanceof Error ? erro.message : String(erro);

        if (msg.includes('Invalid credentials') || msg.includes('user_invalid_credentials')) {
            return NextResponse.json(
                { sucesso: false, erro: 'E-mail ou senha incorretos. Verifique suas credenciais.' },
                { status: 401 }
            );
        }

        if (msg.includes('Rate limit') || msg.includes('rate_limit')) {
            return NextResponse.json(
                { sucesso: false, erro: 'Muitas tentativas. Aguarde alguns minutos.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { sucesso: false, erro: 'Erro ao fazer login. Tente novamente.' },
            { status: 500 }
        );
    }
}
