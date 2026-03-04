import { listarClientes } from '@/lib/actions/clientes';
import { listarLeads } from '@/lib/actions/leads';
import { Users, BarChart3, TrendingUp, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Admin – LeadsCRM' };

export default async function PaginaAdmin() {
    const [respostaClientes, respostaLeads] = await Promise.all([
        listarClientes(),
        listarLeads({ porPagina: 1 }),
    ]);

    const clientes = respostaClientes.dados?.clientes || [];
    const totalLeads = respostaLeads.dados?.total || 0;
    const clientesAtivos = clientes.filter(c => c.ativo).length;

    const cartoes = [
        {
            titulo: 'Total de Clientes',
            valor: clientes.length,
            icone: Users,
            cor: 'from-violet-500 to-purple-600',
            descricao: `${clientesAtivos} ativos`,
        },
        {
            titulo: 'Total de Leads',
            valor: totalLeads,
            icone: BarChart3,
            cor: 'from-blue-500 to-cyan-500',
            descricao: 'Todos os clientes',
        },
        {
            titulo: 'Clientes Ativos',
            valor: clientesAtivos,
            icone: UserCheck,
            cor: 'from-emerald-500 to-green-600',
            descricao: 'Com acesso liberado',
        },
        {
            titulo: 'Crescimento',
            valor: `${clientes.length > 0 ? '+' : ''}${clientes.filter(c => {
                const href = new Date(c.$createdAt);
                const umMesAtras = new Date(); umMesAtras.setMonth(umMesAtras.getMonth() - 1);
                return href > umMesAtras;
            }).length}`,
            icone: TrendingUp,
            cor: 'from-orange-500 to-amber-500',
            descricao: 'Clientes este mês',
        },
    ];

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-slate-900 dark:text-white text-2xl font-bold">Painel Administrativo</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie todos os seus clientes e leads</p>
            </div>

            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {cartoes.map((cartao) => {
                    const Icone = cartao.icone;
                    return (
                        <Card key={cartao.titulo} className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:shadow-md dark:hover:bg-white/8 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-slate-500 dark:text-slate-400 text-sm font-medium">{cartao.titulo}</CardTitle>
                                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cartao.cor} flex items-center justify-center`}>
                                        <Icone className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-900 dark:text-white text-3xl font-bold">{cartao.valor}</p>
                                <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">{cartao.descricao}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Resumo de Clientes Rápidos */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-slate-900 dark:text-white text-lg font-semibold">Clientes Recentes</h2>
                        <p className="text-slate-500 text-sm">Os últimos clientes cadastrados no sistema</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {clientes.slice(0, 5).map((cliente) => (
                        <div key={cliente.$id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                    style={{ background: `linear-gradient(135deg, ${cliente.brandingCorPrimaria || '#7c3aed'}, ${cliente.brandingCorPrimaria || '#7c3aed'}99)` }}
                                >
                                    {cliente.nome.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-slate-900 dark:text-white font-medium">{cliente.nome}</p>
                                    <p className="text-slate-500 text-xs">{cliente.email}</p>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${cliente.ativo ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-500'}`}>
                                {cliente.ativo ? 'Ativo' : 'Inativo'}
                            </div>
                        </div>
                    ))}

                    {clientes.length === 0 && (
                        <p className="text-slate-500 text-center py-8">Nenhum cliente cadastrado ainda.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
