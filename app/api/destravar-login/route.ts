import { NextRequest, NextResponse } from 'next/server';
import { Client, Users, Query } from 'node-appwrite';

/**
 * ROTA DE EMERGÊNCIA: Login sem passar pelo Rate Limit
 * GET /api/destravar-login
 *
 * Esta rota usa a API KEY de Administrador para criar uma sessão para o e-mail principal.
 * Como utiliza a API Key interna, ela ignora as proteções de abuso (429) que se aplicam
 * ao endpoint público de e-mail/senha.
 */
export async function GET(req: NextRequest) {
    try {
        const emailAdmin = process.env.ADMIN_EMAIL || 'nei@grovehub.com.br';
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
        const apiKey = process.env.APPWRITE_API_KEY!;

        const cliente = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);

        const users = new Users(cliente);

        // 1. Busca o usuário pelo e-mail
        const listaUsuarios = await users.list([
            Query.equal('email', emailAdmin)
        ]);

        if (listaUsuarios.total === 0) {
            return NextResponse.json({ erro: 'Usuário administrador não encontrado.' }, { status: 404 });
        }

        const usuario = listaUsuarios.users[0];

        // 2. Cria uma sessão usando a API Key (isso não sofre block de 429 de login público)
        // Nota: O método createSession exige userId.
        const sessao = await users.createSession(usuario.$id);

        // 3. Define o cookie e redireciona para o admin
        const resposta = NextResponse.redirect(new URL('/admin', req.url));

        resposta.cookies.set('sessao-appwrite', sessao.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 dias
        });

        console.log(`✅ Login de emergência realizado para: ${emailAdmin}`);
        return resposta;

    } catch (erro) {
        console.error('[/api/destravar-login] Erro crítico:', erro);
        return NextResponse.json({
            erro: 'Falha no login de emergência.',
            detalhe: erro instanceof Error ? erro.message : String(erro)
        }, { status: 500 });
    }
}
