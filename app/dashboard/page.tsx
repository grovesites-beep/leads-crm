import { listarLeads } from '@/lib/actions/leads';
import { obterMeuCliente } from '@/lib/actions/clientes';
import { TabelaLeads } from '@/components/leads/TabelaLeads';
import { BarChart3, UserRound, Phone, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Meus Leads – LeadsCRM' };

export default async function PaginaDashboard() {
    const [respostaLeads, respostaCliente] = await Promise.all([
        listarLeads({ porPagina: 50 }),
        obterMeuCliente(),
    ]);

    const leads = respostaLeads.dados?.leads || [];
    const total = respostaLeads.dados?.total || 0;
    const cliente = respostaCliente.dados?.cliente;

    const novos = leads.filter(l => l.status === 'novo').length;
    const qualificados = leads.filter(l => l.status === 'qualificado').length;
    const convertidos = leads.filter(l => l.status === 'convertido').length;

    const cartoes = [
        { titulo: 'Total de Leads', valor: total, icone: BarChart3, cor: 'from-violet-500 to-purple-600' },
        { titulo: 'Novos', valor: novos, icone: UserRound, cor: 'from-blue-500 to-cyan-500' },
        { titulo: 'Qualificados', valor: qualificados, icone: Phone, cor: 'from-orange-500 to-amber-500' },
        { titulo: 'Convertidos', valor: convertidos, icone: Star, cor: 'from-emerald-500 to-green-600' },
    ];

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-white text-2xl font-bold">
                    Olá, {cliente?.nome || 'Cliente'} 👋
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Aqui estão os seus leads em tempo real
                </p>
            </div>

            {/* Cards de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Tabela de Leads */}
            <TabelaLeads leadsIniciais={leads} />
        </div>
    );
}
