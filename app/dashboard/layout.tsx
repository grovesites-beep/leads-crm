import { redirect } from 'next/navigation';
import { obterUsuarioAtual, verificarSeEhAdmin } from '@/lib/appwrite/autenticacao';
import { obterMeuCliente } from '@/lib/actions/clientes';
import { SidebarCliente } from '@/components/layouts/SidebarCliente';
import { BotaoToggleTema } from '@/components/tema/BotaoToggleTema';

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
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a14] transition-colors duration-300">
            <SidebarCliente
                nomeCliente={cliente?.nome}
                corPrimaria={cliente?.brandingCorPrimaria}
            />
            <div className="flex-1 flex flex-col overflow-auto">
                {/* Barra superior com botão de tema */}
                <header className="flex items-center justify-end px-6 py-3 bg-white dark:bg-transparent border-b border-slate-200 dark:border-white/5 sticky top-0 z-10 backdrop-blur-sm">
                    <BotaoToggleTema />
                </header>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
