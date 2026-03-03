import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export const metadata = { title: 'Relatórios – LeadsCRM' };

export default async function PaginaRelatorios() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-white text-2xl font-bold">Relatórios e Métricas</h1>
                <p className="text-slate-400 text-sm mt-1">Analise o desempenho da sua captação de leads</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-violet-400" />
                            Conversão Semanal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-40 flex items-center justify-center border-t border-white/5">
                        <p className="text-slate-600 text-xs uppercase tracking-widest font-bold">Gráfico em breve</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-blue-400" />
                            Status dos Leads
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-40 flex items-center justify-center border-t border-white/5">
                        <p className="text-slate-600 text-xs uppercase tracking-widest font-bold">Gráfico em breve</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            Origens Principais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-40 flex items-center justify-center border-t border-white/5">
                        <p className="text-slate-600 text-xs uppercase tracking-widest font-bold">Gráfico em breve</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
