import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Proxy de login server-side para o Appwrite
 * POST /api/autenticar
 *
 * Usa fetch diretamente na REST API do Appwrite (mais confiável que o SDK em Route Handlers).
 * Por ser server-side, não há CORS e não é necessário plataforma Web cadastrada no Appwrite.
 */
export async function POST(req: NextRequest) {
    try {
        const corpo = await req.json();
        const { email, senha } = corpo;

        if (!email || !senha) {
            return NextResponse.json(
                { sucesso: false, erro: 'E-mail e senha são obrigatórios.' },
                { status: 400 }
            );
        }

        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

        // 1. Cria sessão via REST API do Appwrite (server → Appwrite, sem CORS)
        const respostaSessao = await fetch(`${endpoint}/account/sessions/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': projectId,
                'X-Appwrite-Response-Format': '1.0.0',
            },
            body: JSON.stringify({ email, password: senha }),
        });

        const dadosSessao = await respostaSessao.json();

        if (!respostaSessao.ok) {
            console.error('[/api/autenticar] Appwrite sessão erro:', dadosSessao);

            if (respostaSessao.status === 401 || dadosSessao.type === 'user_invalid_credentials') {
                return NextResponse.json(
                    { sucesso: false, erro: 'E-mail ou senha incorretos.' },
                    { status: 401 }
                );
            }
            if (respostaSessao.status === 429) {
                return NextResponse.json(
                    { sucesso: false, erro: 'Muitas tentativas. Aguarde alguns minutos.' },
                    { status: 429 }
                );
            }
            return NextResponse.json(
                { sucesso: false, erro: dadosSessao.message || 'Erro ao autenticar.' },
                { status: respostaSessao.status }
            );
        }

        const secretSessao: string = dadosSessao.secret;

        // 2. Busca dados do usuário com a sessão criada
        const respostaUsuario = await fetch(`${endpoint}/account`, {
            headers: {
                'X-Appwrite-Project': projectId,
                'X-Appwrite-Session': secretSessao,
                'X-Appwrite-Response-Format': '1.0.0',
            },
        });

        const dadosUsuario = await respostaUsuario.json();

        // 3. Determina o papel (role) do usuário
        const emailAdmin = process.env.ADMIN_EMAIL || 'nei@grovehub.com.br';
        const temLabelAdmin = Array.isArray(dadosUsuario.labels) && dadosUsuario.labels.includes('admin');
        const ehAdmin = temLabelAdmin || dadosUsuario.email === emailAdmin;
        const redirecionarPara = ehAdmin ? '/admin' : '/dashboard';

        // 4. Cria a resposta e define o cookie httpOnly com o secret da sessão
        const resposta = NextResponse.json({ sucesso: true, redirecionarPara });

        resposta.cookies.set('sessao-appwrite', secretSessao, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 dias
        });

        return resposta;

    } catch (erro) {
        console.error('[/api/autenticar] Exceção não tratada:', erro);
        return NextResponse.json(
            { sucesso: false, erro: 'Erro interno do servidor. Tente novamente.' },
            { status: 500 }
        );
    }
}
