import { redirect } from 'next/navigation';
import { obterUsuarioAtual, verificarSeEhAdmin } from '@/lib/appwrite/autenticacao';

/**
 * Página raiz: redireciona o usuário para a área correta baseado no seu papel.
 * Admin → /admin
 * Cliente → /dashboard
 * Não autenticado → /login
 */
export default async function PaginaRaiz() {
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
