import { redirect } from 'next/navigation';
import { obterUsuarioAtual } from '@/lib/appwrite/autenticacao';
import { obterMeuCliente } from '@/lib/actions/clientes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Webhook, Palette, Users } from 'lucide-react';
import { SidebarCliente } from '@/components/layouts/SidebarCliente';
import { FormularioBranding } from '@/components/configuracoes/FormularioBranding';

export const metadata = { title: 'Configurações – LeadsCRM' };

export default async function PaginaConfiguracoes() {
    const usuario = await obterUsuarioAtual();
    if (!usuario) redirect('/login');

    const respostaCliente = await obterMeuCliente();
    const cliente = respostaCliente.dados?.cliente;

    if (!cliente) redirect('/dashboard');

    const urlWebhook = `${process.env.NEXT_PUBLIC_APP_URL || 'https://leads.grovehub.com.br'}/api/webhook/${cliente.webhookToken}`;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a14] transition-colors duration-300">
            <SidebarCliente nomeCliente={cliente.nome} corPrimaria={cliente.brandingCorPrimaria} />
            <main className="flex-1 p-8 space-y-6 max-w-3xl overflow-auto">
                <div>
                    <h1 className="text-slate-900 dark:text-white text-2xl font-bold">Configurações</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Personalize sua conta e integrações</p>
                </div>

                <Tabs defaultValue="integracoes" className="space-y-6">
                    <TabsList className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl">
                        <TabsTrigger value="integracoes" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-500 dark:text-slate-400 rounded-lg">
                            <Webhook className="w-4 h-4" />
                            Integrações
                        </TabsTrigger>
                        <TabsTrigger value="branding" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-500 dark:text-slate-400 rounded-lg">
                            <Palette className="w-4 h-4" />
                            Branding
                        </TabsTrigger>
                        <TabsTrigger value="permissoes" className="gap-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-500 dark:text-slate-400 rounded-lg">
                            <Users className="w-4 h-4" />
                            Permissões
                        </TabsTrigger>
                    </TabsList>

                    {/* Aba Integrações */}
                    <TabsContent value="integracoes">
                        <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
                                    <Webhook className="w-5 h-5 text-violet-500" />
                                    Webhook para n8n
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    Configure esta URL no seu workflow do n8n para receber leads automaticamente.
                                    Envie um <Badge variant="outline" className="text-xs font-mono border-slate-200 dark:border-white/20 text-slate-700 dark:text-slate-300">POST</Badge> com os dados do lead.
                                </p>

                                <div className="bg-slate-50 dark:bg-black/30 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                                    <p className="text-slate-500 text-xs mb-2">URL do Webhook</p>
                                    <div className="flex items-center gap-3">
                                        <code className="text-violet-600 dark:text-violet-300 text-sm font-mono flex-1 break-all">{urlWebhook}</code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white flex-shrink-0"
                                            title="Copiar URL"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10 space-y-3">
                                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Formato esperado (JSON)</p>
                                    <pre className="text-slate-500 dark:text-slate-400 text-xs font-mono bg-white dark:bg-black/30 p-3 rounded-lg overflow-auto">
                                        {`{\n  "nome": "João Silva",\n  "email": "joao@exemplo.com",\n  "telefone": "(11) 99999-9999",\n  "origem": "landing-page-principal"\n}`}
                                    </pre>
                                </div>

                                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4">
                                    <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-1">✓ Token de autenticação</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                                        O token único está embutido na URL. Apenas requisições com o token correto são aceitas.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Aba Branding */}
                    <TabsContent value="branding">
                        <FormularioBranding
                            clienteId={cliente.$id}
                            corAtual={cliente.brandingCorPrimaria || '#7c3aed'}
                        />
                    </TabsContent>

                    {/* Aba Permissões */}
                    <TabsContent value="permissoes">
                        <Card className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-900 dark:text-white text-base">Usuários e Permissões</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-4">
                                    <p className="text-yellow-700 dark:text-yellow-400 text-sm font-medium mb-1">ℹ️ Em breve</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        O gerenciamento de usuários extras ainda está sendo desenvolvido.
                                        Por enquanto, entre em contato com o administrador para adicionar novos usuários.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
