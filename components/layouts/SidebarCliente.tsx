'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronRight,
    Zap,
    BarChart3,
} from 'lucide-react';
import { acaoLogout } from '@/lib/actions/autenticacao';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const itensNavegacao = [
    { href: '/dashboard', icone: LayoutDashboard, rotulo: 'Meus Leads' },
    { href: '/dashboard/relatorios', icone: BarChart3, rotulo: 'Relatórios' },
    { href: '/configuracoes', icone: Settings, rotulo: 'Configurações' },
];

interface SidebarClienteProps {
    nomeCliente?: string;
    corPrimaria?: string;
}

export function SidebarCliente({ nomeCliente, corPrimaria = '#7c3aed' }: SidebarClienteProps) {
    const caminho = usePathname();

    return (
        <aside className="flex flex-col w-64 min-h-screen bg-[#080810] border-r border-white/10">
            {/* Logo */}
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${corPrimaria}, ${corPrimaria}99)` }}
                    >
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-white font-bold text-base">LeadsCRM</span>
                        {nomeCliente && (
                            <span className="text-slate-500 text-xs font-medium block -mt-0.5 truncate max-w-[120px]">
                                {nomeCliente}
                            </span>
                        )}
                    </div>
                </Link>
            </div>

            <Separator className="bg-white/5" />

            {/* Navegação */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="text-slate-600 text-xs font-medium uppercase tracking-wider px-3 mb-3">
                    Menu
                </p>
                {itensNavegacao.map((item) => {
                    const Icone = item.icone;
                    const ativo = caminho === item.href || (item.href !== '/dashboard' && caminho.startsWith(item.href));
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
