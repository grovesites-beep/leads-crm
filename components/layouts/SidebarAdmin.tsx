'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
    Zap,
} from 'lucide-react';
import { acaoLogout } from '@/lib/actions/autenticacao';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const itensNavegacao = [
    { href: '/admin', icone: LayoutDashboard, rotulo: 'Visão Geral' },
    { href: '/admin/clientes', icone: Users, rotulo: 'Clientes' },
    { href: '/admin/leads', icone: BarChart3, rotulo: 'Todos os Leads' },
    { href: '/admin/configuracoes', icone: Settings, rotulo: 'Configurações' },
];

export function SidebarAdmin() {
    const caminho = usePathname();

    return (
        <aside className="flex flex-col w-64 min-h-screen bg-[#080810] border-r border-white/10">
            {/* Logo */}
            <div className="p-6">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-white font-bold text-base">LeadsCRM</span>
                        <span className="text-violet-400 text-xs font-medium block -mt-0.5">Admin</span>
                    </div>
                </Link>
            </div>

            <Separator className="bg-white/5" />

            {/* Navegação */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-slate-600 text-xs font-medium uppercase tracking-wider px-3 mb-3">
                    Painel
                </p>
                {itensNavegacao.map((item) => {
                    const Icone = item.icone;
                    const ativo = caminho === item.href || (item.href !== '/admin' && caminho.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                                ativo
                                    ? 'bg-violet-600/20 text-violet-400 border border-violet-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <Icone className={cn('w-4 h-4 flex-shrink-0', ativo ? 'text-violet-400' : 'text-slate-500 group-hover:text-white')} />
                            <span>{item.rotulo}</span>
                            {ativo && <ChevronRight className="w-3 h-3 ml-auto text-violet-400" />}
                        </Link>
                    );
                })}
            </nav>

            <Separator className="bg-white/5" />

            {/* Footer: Sair */}
            <div className="p-4">
                <form action={acaoLogout}>
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </Button>
                </form>
            </div>
        </aside>
    );
}
