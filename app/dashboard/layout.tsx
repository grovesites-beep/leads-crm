import { redirect } from 'next/navigation';
import { obterUsuarioAtual, verificarSeEhAdmin } from '@/lib/appwrite/autenticacao';
import { obterMeuCliente } from '@/lib/actions/clientes';
import { SidebarCliente } from '@/components/layouts/SidebarCliente';

export default async function LayoutDashboard({ children }: { children: React.ReactNode }) {
    const usuario = await obterUsuarioAtual();
    if (!usuario) redirect('/login');

    // Admin não deve acessar o dashboard de cliente
    const ehAdmin = await verificarSeEhAdmin(usuario);
    if (ehAdmin) redirect('/admin');

    // Busca dados do cliente para o branding
    const respostaCliente = await obterMeuCliente();
    const cliente = respostaCliente.dados?.cliente;

    return (
        <div className="flex min-h-screen bg-[#0a0a14]">
            <SidebarCliente
                nomeCliente={cliente?.nome}
                corPrimaria={cliente?.brandingCorPrimaria}
            />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
