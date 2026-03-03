import { notFound } from 'next/navigation';
import { obterLead } from '@/lib/actions/leads';
import { COR_STATUS_LEAD, LABEL_STATUS_LEAD } from '@/lib/tipos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Mail, Phone, Globe, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormularioEditarLead } from '@/components/leads/FormularioEditarLead';

interface PaginaDetalhesLeadProps {
    params: Promise<{ id: string }>;
}

export default async function PaginaDetalhesLead({ params }: PaginaDetalhesLeadProps) {
    const { id } = await params;
    const resposta = await obterLead(id);

    if (!resposta.sucesso || !resposta.dados?.lead) {
        notFound();
    }

    const lead = resposta.dados.lead;
    let metadados: Record<string, string> = {};
    try {
        metadados = JSON.parse(lead.metadados || '{}');
    } catch { /* metadados inválidos */ }

    return (
        <div className="p-8 space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white border border-white/10 rounded-lg">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-white text-xl font-bold">{lead.nome}</h1>
                        <p className="text-slate-400 text-sm">Detalhes do lead</p>
                    </div>
                    <Badge className={`${COR_STATUS_LEAD[lead.status]} border rounded-full px-3`}>
                        {LABEL_STATUS_LEAD[lead.status]}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações do Lead */}
                <Card className="bg-white/5 border-white/10 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Informações de Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {lead.email && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">E-mail</p>
                                    <a href={`mailto:${lead.email}`} className="text-white hover:text-violet-400 transition-colors">
                                        {lead.email}
                                    </a>
                                </div>
                            </div>
                        )}
                        {lead.telefone && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Telefone</p>
                                    <a href={`tel:${lead.telefone}`} className="text-white hover:text-violet-400 transition-colors">
                                        {lead.telefone}
                                    </a>
                                </div>
                            </div>
                        )}
                        {lead.origem && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Origem</p>
                                    <p className="text-white capitalize">{lead.origem}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Recebido em</p>
                                <p className="text-white">
                                    {format(new Date(lead.$createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                        </div>

                        {/* Metadados extras do n8n */}
                        {Object.keys(metadados).length > 0 && (
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <p className="text-slate-400 text-sm font-medium">Dados extras do webhook</p>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(metadados).map(([chave, valor]) => (
                                        <div key={chave} className="flex items-start gap-2 text-sm">
                                            <span className="text-slate-500 capitalize min-w-24">{chave}:</span>
                                            <span className="text-slate-300">{String(valor)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Formulário de atualização */}
                <FormularioEditarLead lead={lead} />
            </div>
        </div>
    );
}
