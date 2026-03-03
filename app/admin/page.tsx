import { listarClientes } from '@/lib/actions/clientes';
import { listarLeads } from '@/lib/actions/leads';
import { Users, BarChart3, TrendingUp, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabelaClientes } from '@/components/admin/TabelaClientes';

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
                <h1 className="text-white text-2xl font-bold">Painel Administrativo</h1>
                <p className="text-slate-400 text-sm mt-1">Gerencie todos os seus clientes e leads</p>
            </div>

            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {cartoes.map((cartao) => {
                    const Icone = cartao.icone;
                    return (
                        <Card key={cartao.titulo} className="bg-white/5 border-white/10 hover:bg-white/8 transition-colors">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-slate-400 text-sm font-medium">{cartao.titulo}</CardTitle>
                                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cartao.cor} flex items-center justify-center`}>
                                        <Icone className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-white text-3xl font-bold">{cartao.valor}</p>
                                <p className="text-slate-500 text-xs mt-1">{cartao.descricao}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Tabela de clientes */}
            <div>
                <h2 className="text-white text-lg font-semibold mb-4">Clientes Cadastrados</h2>
                <TabelaClientes clientesIniciais={clientes} />
            </div>
        </div>
    );
}
