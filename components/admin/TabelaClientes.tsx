'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Cliente } from '@/lib/tipos';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { criarCliente, excluirCliente } from '@/lib/actions/clientes';
import { toast } from 'sonner';
import {
    MoreHorizontal, Plus, Search, Trash2, Eye, Copy, Loader2, UserPlus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const esquemaCriarCliente = z.object({
    nome: z.string().min(2, 'Nome muito curto'),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
    plano: z.string().optional(),
});

type FormularioCriarCliente = z.infer<typeof esquemaCriarCliente>;

interface TabelaClientesProps {
    clientesIniciais: Cliente[];
}

export function TabelaClientes({ clientesIniciais }: TabelaClientesProps) {
    const router = useRouter();
    const [busca, setBusca] = useState('');
    const [dialogAberto, setDialogAberto] = useState(false);
    const [isPending, startTransition] = useTransition();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormularioCriarCliente>({
        resolver: zodResolver(esquemaCriarCliente),
    });

    const clientesFiltrados = clientesIniciais.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.email.toLowerCase().includes(busca.toLowerCase())
    );

    const aoSubmeterCriarCliente = (dados: FormularioCriarCliente) => {
        startTransition(async () => {
            const resultado = await criarCliente({
                nome: dados.nome,
                email: dados.email,
                senha: dados.senha || undefined,
                plano: dados.plano || 'basico',
            });

            if (resultado.sucesso) {
                toast.success(resultado.mensagem);
                setDialogAberto(false);
                reset();
                router.refresh();
            } else {
                toast.error(resultado.erro);
            }
        });
    };

    const aoExcluirCliente = (clienteId: string, nome: string) => {
        if (!confirm(`Tem certeza que deseja excluir o cliente "${nome}"? Esta ação não pode ser desfeita.`)) return;

        startTransition(async () => {
            const resultado = await excluirCliente(clienteId);
            if (resultado.sucesso) {
                toast.success(resultado.mensagem);
                router.refresh();
            } else {
                toast.error(resultado.erro);
            }
        });
    };

    const copiarToken = (token: string) => {
        navigator.clipboard.writeText(token);
        toast.success('Token copiado!');
    };

    return (
        <div className="space-y-4">
            {/* Barra de ações */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Buscar clientes..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-lg"
                    />
                </div>

                <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                    <DialogTrigger asChild>
                        <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-2 rounded-lg">
                            <Plus className="w-4 h-4" />
                            Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0f0f1a] border-white/10 text-white max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-violet-400" />
                                Criar Novo Cliente
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(aoSubmeterCriarCliente)} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Nome</Label>
                                <Input
                                    {...register('nome')}
                                    placeholder="Nome do cliente"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                                />
                                {errors.nome && <p className="text-red-400 text-xs">{errors.nome.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">E-mail</Label>
                                <Input
                                    {...register('email')}
                                    type="email"
                                    placeholder="cliente@empresa.com"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                                />
                                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">
                                    Senha <span className="text-slate-500 text-xs">(deixe em branco para gerar automaticamente)</span>
                                </Label>
                                <Input
                                    {...register('senha')}
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                                />
                                {errors.senha && <p className="text-red-400 text-xs">{errors.senha.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Plano</Label>
                                <Input
                                    {...register('plano')}
                                    placeholder="basico, profissional, premium"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-violet-600 hover:bg-violet-500 text-white"
                            >
                                {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</> : 'Criar Cliente'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabela */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-slate-400">Cliente</TableHead>
                            <TableHead className="text-slate-400">Plano</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Token Webhook</TableHead>
                            <TableHead className="text-slate-400">Criado em</TableHead>
                            <TableHead className="text-slate-400 w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clientesFiltrados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-slate-500 py-12">
                                    {busca ? 'Nenhum cliente encontrado com essa busca.' : 'Nenhum cliente cadastrado.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            clientesFiltrados.map((cliente) => (
                                <TableRow key={cliente.$id} className="border-white/5 hover:bg-white/3">
                                    <TableCell>
                                        <div>
                                            <p className="text-white font-medium">{cliente.nome}</p>
                                            <p className="text-slate-500 text-xs">{cliente.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-white/20 text-slate-300 capitalize">
                                            {cliente.plano || 'básico'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={cliente.ativo
                                                ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                                : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                            }
                                        >
                                            {cliente.ativo ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => copiarToken(cliente.webhookToken)}
                                            className="flex items-center gap-1.5 text-slate-500 hover:text-violet-400 transition-colors text-xs font-mono"
                                            title="Clique para copiar"
                                        >
                                            <span>{cliente.webhookToken?.substring(0, 12)}...</span>
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {format(new Date(cliente.$createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-500 hover:text-white">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-[#0f0f1a] border-white/10" align="end">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/admin/clientes/${cliente.$id}`)}
                                                    className="text-slate-300 hover:text-white cursor-pointer"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Ver detalhes
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => aoExcluirCliente(cliente.$id, cliente.nome)}
                                                    className="text-red-400 hover:text-red-300 cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Excluir
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
