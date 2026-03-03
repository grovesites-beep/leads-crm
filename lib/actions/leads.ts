'use server';

import { ID, Query } from 'node-appwrite';
import { criarClienteServidor, IDS_BANCO } from '@/lib/appwrite/servidor';
import { obterUsuarioAtual, verificarSeEhAdmin } from '@/lib/appwrite/autenticacao';
import { LeadFormulario, RespostaAction, Lead, StatusLead } from '@/lib/tipos';

/**
 * Server Action: Lista os leads do cliente atual (ou de todos os clientes para o admin)
 */
export async function listarLeads(
    opcoes?: { clienteId?: string; status?: StatusLead; pagina?: number; porPagina?: number }
): Promise<RespostaAction<{ leads: Lead[]; total: number }>> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!usuario) return { sucesso: false, erro: 'Não autenticado.' };

        const ehAdmin = await verificarSeEhAdmin(usuario);
        const { banco } = criarClienteServidor();

        const filtros = [];
        const limite = opcoes?.porPagina || 25;
        const deslocamento = ((opcoes?.pagina || 1) - 1) * limite;

        // Admin pode ver todos os leads ou filtrar por cliente
        // Cliente só pode ver seus próprios leads
        if (!ehAdmin) {
            // Busca o clienteId do usuário atual
            const respCliente = await banco.listDocuments(
                IDS_BANCO.DATABASE_ID,
                IDS_BANCO.COLECAO_CLIENTES,
                [Query.equal('appwriteUserId', usuario.$id), Query.limit(1)]
            );
            if (respCliente.documents.length === 0) {
                return { sucesso: false, erro: 'Perfil de cliente não encontrado.' };
            }
            filtros.push(Query.equal('clienteId', respCliente.documents[0].$id));
        } else if (opcoes?.clienteId) {
            filtros.push(Query.equal('clienteId', opcoes.clienteId));
        }

        if (opcoes?.status) {
            filtros.push(Query.equal('status', opcoes.status));
        }

        filtros.push(Query.orderDesc('$createdAt'));
        filtros.push(Query.limit(limite));
        filtros.push(Query.offset(deslocamento));

        const resposta = await banco.listDocuments(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_LEADS,
            filtros
        );

        return {
            sucesso: true,
            dados: {
                leads: resposta.documents as unknown as Lead[],
                total: resposta.total,
            },
        };
    } catch (erro) {
        console.error('[listarLeads]', erro);
        return { sucesso: false, erro: 'Erro ao buscar leads.' };
    }
}

/**
 * Server Action: Obtém um lead específico por ID
 */
export async function obterLead(leadId: string): Promise<RespostaAction<{ lead: Lead }>> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!usuario) return { sucesso: false, erro: 'Não autenticado.' };

        const { banco } = criarClienteServidor();
        const lead = await banco.getDocument(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_LEADS,
            leadId
        );

        return {
            sucesso: true,
            dados: { lead: lead as unknown as Lead },
        };
    } catch (erro) {
        console.error('[obterLead]', erro);
        return { sucesso: false, erro: 'Lead não encontrado.' };
    }
}

/**
 * Server Action: Atualiza os dados de um lead (status, notas)
 */
export async function atualizarLead(
    leadId: string,
    formulario: Partial<LeadFormulario>
): Promise<RespostaAction> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!usuario) return { sucesso: false, erro: 'Não autenticado.' };

        const { banco } = criarClienteServidor();
        await banco.updateDocument(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_LEADS,
            leadId,
            {
                status: formulario.status,
                notas: formulario.notas,
                nome: formulario.nome,
                email: formulario.email,
                telefone: formulario.telefone,
            }
        );

        return { sucesso: true, mensagem: 'Lead atualizado com sucesso!' };
    } catch (erro) {
        console.error('[atualizarLead]', erro);
        return { sucesso: false, erro: 'Erro ao atualizar lead.' };
    }
}

/**
 * Server Action: Cria um lead manualmente (admin/cliente)
 */
export async function criarLead(
    clienteId: string,
    formulario: LeadFormulario
): Promise<RespostaAction<{ leadId: string }>> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!usuario) return { sucesso: false, erro: 'Não autenticado.' };

        const { banco } = criarClienteServidor();

        // Consolida notas+extras no campo metadados (workaround limite Appwrite)
        const metadados = JSON.stringify({ notas: formulario.notas || '', extras: {} });

        const lead = await banco.createDocument(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_LEADS,
            ID.unique(),
            {
                clienteId,
                nome: formulario.nome,
                email: formulario.email || '',
                telefone: formulario.telefone || '',
                origem: formulario.origem || 'manual',
                status: formulario.status || 'novo',
                metadados,
            }
        );

        return {
            sucesso: true,
            mensagem: 'Lead criado com sucesso!',
            dados: { leadId: lead.$id },
        };
    } catch (erro) {
        console.error('[criarLead]', erro);
        return { sucesso: false, erro: 'Erro ao criar lead.' };
    }
}

/**
 * Server Action: Exclui um lead
 */
export async function excluirLead(leadId: string): Promise<RespostaAction> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!usuario) return { sucesso: false, erro: 'Não autenticado.' };

        const { banco } = criarClienteServidor();
        await banco.deleteDocument(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_LEADS,
            leadId
        );

        return { sucesso: true, mensagem: 'Lead excluído com sucesso.' };
    } catch (erro) {
        console.error('[excluirLead]', erro);
        return { sucesso: false, erro: 'Erro ao excluir lead.' };
    }
}
