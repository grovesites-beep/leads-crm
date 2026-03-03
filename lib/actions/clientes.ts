'use server';

import { ID, Query } from 'node-appwrite';
import { criarClienteServidor, IDS_BANCO } from '@/lib/appwrite/servidor';
import { obterUsuarioAtual, verificarSeEhAdmin } from '@/lib/appwrite/autenticacao';
import { ClienteFormulario, RespostaAction, Cliente } from '@/lib/tipos';
import { randomUUID } from 'crypto';

/**
 * Server Action: Lista todos os clientes (somente admin)
 */
export async function listarClientes(): Promise<RespostaAction<{ clientes: Cliente[] }>> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!await verificarSeEhAdmin(usuario)) {
            return { sucesso: false, erro: 'Acesso não autorizado.' };
        }

        const { banco } = criarClienteServidor();
        const resposta = await banco.listDocuments(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_CLIENTES,
            [Query.orderDesc('$createdAt'), Query.limit(100)]
        );

        return {
            sucesso: true,
            dados: { clientes: resposta.documents as unknown as Cliente[] },
        };
    } catch (erro) {
        console.error('[listarClientes]', erro);
        return { sucesso: false, erro: 'Erro ao buscar clientes.' };
    }
}

/**
 * Server Action: Cria um novo cliente e seu usuário no Appwrite
 */
export async function criarCliente(formulario: ClienteFormulario): Promise<RespostaAction<{ clienteId: string }>> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!await verificarSeEhAdmin(usuario)) {
            return { sucesso: false, erro: 'Acesso não autorizado.' };
        }

        const { banco, usuarios } = criarClienteServidor();

        // Cria o usuário no Appwrite para o cliente
        const senhaGerada = formulario.senha || Math.random().toString(36).slice(-10) + 'A1!';
        const novoUsuario = await usuarios.create(
            ID.unique(),
            formulario.email,
            undefined,
            senhaGerada,
            formulario.nome
        );

        // Gera token único para webhook
        const webhookToken = randomUUID().replace(/-/g, '');

        // Cria o documento do cliente
        const cliente = await banco.createDocument(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_CLIENTES,
            ID.unique(),
            {
                nome: formulario.nome,
                email: formulario.email,
                appwriteUserId: novoUsuario.$id,
                webhookToken,
                brandingCorPrimaria: formulario.brandingCorPrimaria || '#7c3aed',
                plano: formulario.plano || 'basico',
                ativo: formulario.ativo !== false,
            }
        );

        return {
            sucesso: true,
            mensagem: `Cliente "${formulario.nome}" criado com sucesso!`,
            dados: { clienteId: cliente.$id },
        };
    } catch (erro: unknown) {
        console.error('[criarCliente]', erro);
        const msg = erro instanceof Error ? erro.message : '';
        if (msg.includes('user_already_exists') || msg.includes('already exists')) {
            return { sucesso: false, erro: 'Já existe um usuário com este e-mail.' };
        }
        return { sucesso: false, erro: 'Erro ao criar cliente.' };
    }
}

/**
 * Server Action: Atualiza dados de um cliente
 */
export async function atualizarCliente(
    clienteId: string,
    formulario: Partial<ClienteFormulario>
): Promise<RespostaAction> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!await verificarSeEhAdmin(usuario)) {
            return { sucesso: false, erro: 'Acesso não autorizado.' };
        }

        const { banco } = criarClienteServidor();
        await banco.updateDocument(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_CLIENTES,
            clienteId,
            {
                nome: formulario.nome,
                brandingCorPrimaria: formulario.brandingCorPrimaria,
                plano: formulario.plano,
                ativo: formulario.ativo,
            }
        );

        return { sucesso: true, mensagem: 'Cliente atualizado com sucesso!' };
    } catch (erro) {
        console.error('[atualizarCliente]', erro);
        return { sucesso: false, erro: 'Erro ao atualizar cliente.' };
    }
}

/**
 * Server Action: Exclui um cliente e seu usuário
 */
export async function excluirCliente(clienteId: string): Promise<RespostaAction> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!await verificarSeEhAdmin(usuario)) {
            return { sucesso: false, erro: 'Acesso não autorizado.' };
        }

        const { banco, usuarios } = criarClienteServidor();

        // Busca o cliente para obter o userId
        const cliente = await banco.getDocument(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_CLIENTES,
            clienteId
        );

        // Remove o usuário do Appwrite
        if (cliente.appwriteUserId) {
            await usuarios.delete(cliente.appwriteUserId);
        }

        // Remove o documento do cliente
        await banco.deleteDocument(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_CLIENTES,
            clienteId
        );

        return { sucesso: true, mensagem: 'Cliente excluído com sucesso.' };
    } catch (erro) {
        console.error('[excluirCliente]', erro);
        return { sucesso: false, erro: 'Erro ao excluir cliente.' };
    }
}

/**
 * Server Action: Obtém o cliente associado ao usuário atual (para o dashboard do cliente)
 */
export async function obterMeuCliente(): Promise<RespostaAction<{ cliente: Cliente }>> {
    try {
        const usuario = await obterUsuarioAtual();
        if (!usuario) return { sucesso: false, erro: 'Não autenticado.' };

        const { banco } = criarClienteServidor();
        const resposta = await banco.listDocuments(
            IDS_BANCO.DATABASE_ID,
            IDS_BANCO.COLECAO_CLIENTES,
            [Query.equal('appwriteUserId', usuario.$id), Query.limit(1)]
        );

        if (resposta.documents.length === 0) {
            return { sucesso: false, erro: 'Cliente não encontrado.' };
        }

        return {
            sucesso: true,
            dados: { cliente: resposta.documents[0] as unknown as Cliente },
        };
    } catch (erro) {
        console.error('[obterMeuCliente]', erro);
        return { sucesso: false, erro: 'Erro ao buscar seu perfil.' };
    }
}
