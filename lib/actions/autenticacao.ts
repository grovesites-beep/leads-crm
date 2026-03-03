'use server';

import { redirect } from 'next/navigation';
import { criarSessao, encerrarSessao, obterUsuarioAtual, verificarSeEhAdmin } from '@/lib/appwrite/autenticacao';
import { RespostaAction } from '@/lib/tipos';

/**
 * Server Action: Realiza o login do usuário
 * Autentica com Appwrite, cria o cookie de sessão e redireciona conforme o papel do usuário
 */
export async function acaoLogin(dados: { email: string; senha: string }): Promise<RespostaAction> {
    try {
        await criarSessao(dados.email, dados.senha);

        // Obtém o usuário para verificar o papel (role)
        const usuario = await obterUsuarioAtual();
        const ehAdmin = await verificarSeEhAdmin(usuario);

        return {
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            dados: { redirecionarPara: ehAdmin ? '/admin' : '/dashboard' },
        };
    } catch (erro: unknown) {
        const mensagemErro = erro instanceof Error ? erro.message : 'Erro desconhecido';

        // Traduz mensagens de erro comuns do Appwrite
        if (mensagemErro.includes('Invalid credentials') || mensagemErro.includes('user_invalid_credentials')) {
            return { sucesso: false, erro: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
        }
        if (mensagemErro.includes('Rate limit')) {
            return { sucesso: false, erro: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' };
        }

        return { sucesso: false, erro: 'Erro ao fazer login. Tente novamente.' };
    }
}

/**
 * Server Action: Encerra a sessão do usuário e redireciona para o login
 */
export async function acaoLogout(): Promise<never> {
    await encerrarSessao();
    redirect('/login');
}

/**
 * Server Action: Verifica o usuário atual e redireciona conforme o papel
 */
export async function verificarERedirecionarUsuario() {
    const usuario = await obterUsuarioAtual();

    if (!usuario) {
        redirect('/login');
    }

    const ehAdmin = await verificarSeEhAdmin(usuario);

    if (ehAdmin) {
        redirect('/admin');
    } else {
        redirect('/dashboard');
    }
}
