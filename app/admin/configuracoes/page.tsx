import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ShieldCheck, Database } from 'lucide-react';

export const metadata = { title: 'Configurações – LeadsCRM Admin' };

export default async function PaginaAdminConfiguracoes() {
    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-white text-2xl font-bold">Configurações do Sistema</h1>
                <p className="text-slate-400 text-sm mt-1">Gerencie as configurações globais do CRM</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-violet-400" />
                            Segurança
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-400 text-sm">
                        As configurações de segurança e instâncias do Appwrite estão sendo gerenciadas via variáveis de ambiente.
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-400" />
                            Banco de Dados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-400 text-sm">
                        Conectado ao endpoint: <br />
                        <code className="text-violet-300 text-xs mt-2 block">{process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}</code>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
                <p className="text-yellow-400 font-medium mb-1 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Manutenção
                </p>
                <p className="text-slate-400 text-sm">
                    Recursos avançados de gerenciamento de backups e logs do sistema serão liberados em breve.
                </p>
            </div>
        </div>
    );
}
