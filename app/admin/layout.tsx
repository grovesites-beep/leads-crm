import { redirect } from 'next/navigation';
import { obterUsuarioAtual, verificarSeEhAdmin } from '@/lib/appwrite/autenticacao';
import { SidebarAdmin } from '@/components/layouts/SidebarAdmin';
import { BotaoToggleTema } from '@/components/tema/BotaoToggleTema';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
    // Verifica autenticação e permissão admin
    const usuario = await obterUsuarioAtual();
    if (!usuario) redirect('/login');

    const ehAdmin = await verificarSeEhAdmin(usuario);
    if (!ehAdmin) redirect('/dashboard');

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a14] transition-colors duration-300">
            <SidebarAdmin />
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
