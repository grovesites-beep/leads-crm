"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Palette,
    Link as LinkIcon,
    ShieldCheck,
    Copy,
    ExternalLink,
    Check,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getSettings, updateSettings, getLoggedInUser } from "@/lib/appwrite/actions";

export default function SettingsPage() {
    const [copied, setCopied] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form fields
    const [appName, setAppName] = useState("");
    const [primaryColor, setPrimaryColor] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const loggedUser = await getLoggedInUser();
        setUser(loggedUser);

        if (loggedUser) {
            // Webhook único por cliente
            const baseUrl = `${window.location.protocol}//${window.location.host}/api/webhooks/n8n`;
            setWebhookUrl(`${baseUrl}?clientId=${loggedUser.$id}`);
        }

        const result = await getSettings();
        if (result.success && result.settings) {
            setAppName(result.settings.appName || "");
            setPrimaryColor(result.settings.primaryColor || "#000000");
        }
        setLoading(false);
    };

    const handleSaveBranding = async () => {
        setSaving(true);
        const result = await updateSettings({ appName, primaryColor });
        if (result.success) {
            toast.success("Configurações salvas com sucesso!");
        } else {
            toast.error("Erro ao salvar: " + result.error);
        }
        setSaving(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        toast.success("URL copiada com sucesso!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isAdmin = user?.labels?.includes('admin') || user?.email === 'admin@grovehub.com.br';

    return (
        <div className="flex flex-col gap-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground">
                        {isAdmin ? "Gerencie a plataforma globalmente." : "Configure sua integração e visual."}
                    </p>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Tabs defaultValue={isAdmin ? "branding" : "integrations"} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        {isAdmin && (
                            <TabsTrigger value="branding" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" /> Branding
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="integrations" className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" /> Integrações
                        </TabsTrigger>
                        <TabsTrigger value="permissions" className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Conta
                        </TabsTrigger>
                    </TabsList>

                    {/* Branding Tab (Admin only) */}
                    {isAdmin && (
                        <TabsContent value="branding" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Identidade Visual Global</CardTitle>
                                    <CardDescription>
                                        Altere o nome da plataforma e as cores que seus clientes verão.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="app-name">Nome do Sistema</Label>
                                        <Input
                                            id="app-name"
                                            value={appName}
                                            onChange={(e) => setAppName(e.target.value)}
                                            placeholder="Ex: Grove Leads CRM"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="primary-color">Cor de Destaque</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="primary-color"
                                                    type="color"
                                                    className="p-1 h-10 w-12 cursor-pointer"
                                                    value={primaryColor}
                                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                                />
                                                <Input
                                                    value={primaryColor}
                                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSaveBranding} disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Salvar Alterações
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Integrations Tab */}
                    <TabsContent value="integrations" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Seu Webhook Exclusivo</CardTitle>
                                <CardDescription>
                                    Use esta URL no seu n8n. Cada lead enviado para cá aparecerá automaticamente no seu painel.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>URL de Captura</Label>
                                    <div className="flex gap-2">
                                        <Input readOnly value={webhookUrl} className="bg-muted font-mono text-xs" />
                                        <Button variant="secondary" onClick={copyToClipboard}>
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-orange-500 font-bold uppercase">
                                        ⚠️ Importante: Não compartilhe esta URL. Ela é exclusiva da sua conta.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start gap-4">
                                <div className="text-sm border rounded-md p-4 bg-muted/50 w-full font-medium">
                                    <p className="flex items-center gap-2 mb-2">
                                        <ExternalLink className="h-4 w-4" /> Como integrar via n8n:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                                        <li>Crie um nó "HTTP Request" no n8n.</li>
                                        <li>Método: POST</li>
                                        <li>URL: Cole a URL acima completa.</li>
                                        <li>JSON: Envie campos como `nome`, `email` e `telefone`.</li>
                                    </ul>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Permissions Tab */}
                    <TabsContent value="permissions" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalhes da Conta</CardTitle>
                                <CardDescription>
                                    Suas informações de acesso ao sistema.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <Label>Nome</Label>
                                        <span className="text-sm font-medium">{user?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <Label>E-mail</Label>
                                        <span className="text-sm font-medium">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <Label>Tipo de Acesso</Label>
                                        <Badge>{isAdmin ? "Administrador Master" : "Cliente"}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </BlurFade>
        </div>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            {children}
        </span>
    );
}
