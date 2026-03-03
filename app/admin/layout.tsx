import { redirect } from 'next/navigation';
import { obterUsuarioAtual, verificarSeEhAdmin } from '@/lib/appwrite/autenticacao';
import { SidebarAdmin } from '@/components/layouts/SidebarAdmin';

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
    // Verifica autenticação e permissão admin
    const usuario = await obterUsuarioAtual();
    if (!usuario) redirect('/login');

    const ehAdmin = await verificarSeEhAdmin(usuario);
    if (!ehAdmin) redirect('/dashboard');

    return (
        <div className="flex min-h-screen bg-[#0a0a14]">
            <SidebarAdmin />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
