'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lead, StatusLead, LABEL_STATUS_LEAD, COR_STATUS_LEAD } from '@/lib/tipos';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { atualizarLead } from '@/lib/actions/leads';
import { toast } from 'sonner';
import {
    MoreHorizontal, Search, Eye, RefreshCw, Filter, Phone, Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TabelaLeadsProps {
    leadsIniciais: Lead[];
}

const statusOpcoes: { valor: string; rotulo: string }[] = [
    { valor: 'todos', rotulo: 'Todos os status' },
    { valor: 'novo', rotulo: 'Novo' },
    { valor: 'contatado', rotulo: 'Contatado' },
    { valor: 'qualificado', rotulo: 'Qualificado' },
    { valor: 'perdido', rotulo: 'Perdido' },
    { valor: 'convertido', rotulo: 'Convertido' },
];

export function TabelaLeads({ leadsIniciais }: TabelaLeadsProps) {
    const router = useRouter();
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [isPending, startTransition] = useTransition();

    const leadsFiltrados = leadsIniciais.filter(lead => {
        const correspondeBusca =
            lead.nome.toLowerCase().includes(busca.toLowerCase()) ||
            (lead.email && lead.email.toLowerCase().includes(busca.toLowerCase())) ||
            (lead.telefone && lead.telefone.includes(busca));

        const correspondeStatus = filtroStatus === 'todos' || lead.status === filtroStatus;

        return correspondeBusca && correspondeStatus;
    });

    const alterarStatusLead = (leadId: string, novoStatus: StatusLead) => {
        startTransition(async () => {
            const resultado = await atualizarLead(leadId, { status: novoStatus });
            if (resultado.sucesso) {
                toast.success('Status atualizado!');
                router.refresh();
            } else {
                toast.error(resultado.erro);
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Barra de filtros */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome, e-mail ou telefone..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-9 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-lg"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                        <SelectTrigger className="w-48 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-lg">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#0f0f1a] border-slate-200 dark:border-white/10">
                            {statusOpcoes.map(op => (
                                <SelectItem key={op.valor} value={op.valor} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:text-slate-900 dark:focus:text-white">
                                    {op.rotulo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.refresh()}
                        disabled={isPending}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-lg"
                        title="Atualizar leads"
                    >
                        <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Contagem */}
            <p className="text-slate-500 text-sm">
                {leadsFiltrados.length} de {leadsIniciais.length} leads
            </p>

            {/* Tabela */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-transparent">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-200 dark:border-white/10 hover:bg-transparent bg-slate-50 dark:bg-white/5">
                            <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Lead</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Contato</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Origem</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Status</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Recebido em</TableHead>
                            <TableHead className="text-slate-600 dark:text-slate-400 w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leadsFiltrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-slate-400 py-16">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                                        <p>{busca || filtroStatus !== 'todos' ? 'Nenhum lead encontrado com os filtros aplicados.' : 'Nenhum lead recebido ainda.'}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-600">Os leads chegam automaticamente via webhook do n8n</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            leadsFiltrados.map((lead) => (
                                <TableRow key={lead.$id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 cursor-pointer">
                                    <TableCell onClick={() => router.push(`/dashboard/leads/${lead.$id}`)}>
                                        <p className="text-slate-900 dark:text-white font-medium">{lead.nome}</p>
                                    </TableCell>
                                    <TableCell onClick={() => router.push(`/dashboard/leads/${lead.$id}`)}>
                                        <div className="space-y-0.5">
                                            {lead.email && (
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{lead.email}</span>
                                                </div>
                                            )}
                                            {lead.telefone && (
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{lead.telefone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell onClick={() => router.push(`/dashboard/leads/${lead.$id}`)}>
                                        <span className="text-slate-500 text-sm capitalize">{lead.origem || '—'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={lead.status}
                                            onValueChange={(valor) => alterarStatusLead(lead.$id, valor as StatusLead)}
                                        >
                                            <SelectTrigger className={`w-32 h-7 text-xs border rounded-full px-2 ${COR_STATUS_LEAD[lead.status]} border-current`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-[#0f0f1a] border-slate-200 dark:border-white/10">
                                                {(Object.entries(LABEL_STATUS_LEAD) as [StatusLead, string][]).map(([valor, rotulo]) => (
                                                    <SelectItem key={valor} value={valor} className="text-slate-700 dark:text-slate-300 text-xs">
                                                        {rotulo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {format(new Date(lead.$createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-white dark:bg-[#0f0f1a] border-slate-200 dark:border-white/10" align="end">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/dashboard/leads/${lead.$id}`)}
                                                    className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Ver detalhes
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
