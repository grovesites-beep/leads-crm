import { NextRequest, NextResponse } from 'next/server';
import { ID, Query } from 'node-appwrite';
import { criarClienteServidor, IDS_BANCO } from '@/lib/appwrite/servidor';

/**
 * API Route: Endpoint de webhook para receber leads do n8n
 * POST /api/webhook/[token]
 * 
 * Esta rota é pública (sem autenticação JWT) e aceita POST requests do n8n.
 * O token na URL garante que apenas o cliente correto recebe os leads.
 */
export async function POST(
    requisicao: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        const { banco } = criarClienteServidor();

        // 1. Valida o token na coleção de clientes
        const respostaCliente = await banco.listDocuments(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_CLIENTES,
            [Query.equal('webhookToken', token), Query.equal('ativo', true), Query.limit(1)]
        );

        if (respostaCliente.documents.length === 0) {
            return NextResponse.json(
                { sucesso: false, erro: 'Token inválido ou cliente inativo.' },
                { status: 401 }
            );
        }

        const cliente = respostaCliente.documents[0];

        // 2. Extrai os dados do lead do corpo da requisição
        const corpo = await requisicao.json();

        const { nome, email, telefone, origem, status, ...extras } = corpo;

        if (!nome) {
            return NextResponse.json(
                { sucesso: false, erro: 'Campo "nome" é obrigatório.' },
                { status: 400 }
            );
        }

        // 3. Insere o lead no banco de dados
        const lead = await banco.createDocument(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_LEADS,
            ID.unique(),
            {
                clienteId: cliente.$id,
                nome: String(nome),
                email: String(email || ''),
                telefone: String(telefone || ''),
                origem: String(origem || 'n8n-webhook'),
                status: status || 'novo',
                notas: '',
                metadados: JSON.stringify(extras),
            }
        );

        return NextResponse.json({
            sucesso: true,
            mensagem: 'Lead recebido com sucesso!',
            leadId: lead.$id,
        });

    } catch (erro) {
        console.error('[webhook] Erro ao processar lead:', erro);
        return NextResponse.json(
            { sucesso: false, erro: 'Erro interno ao processar o lead.' },
            { status: 500 }
        );
    }
}

// Responde OPTIONS para CORS (o n8n pode precisar)
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
