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
import { getSettings, updateSettings } from "@/lib/appwrite/actions";

export default function SettingsPage() {
    const [copied, setCopied] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [appName, setAppName] = useState("");
    const [primaryColor, setPrimaryColor] = useState("");

    useEffect(() => {
        setWebhookUrl(`${window.location.protocol}//${window.location.host}/api/webhooks/n8n`);
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
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

    return (
        <div className="flex flex-col gap-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground">
                        Personalize a aparência do sistema, gerencie integrações e controle permissões.
                    </p>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <Tabs defaultValue="branding" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="branding" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" /> Branding
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" /> Integrações
                        </TabsTrigger>
                        <TabsTrigger value="permissions" className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Permissões
                        </TabsTrigger>
                    </TabsList>

                    {/* Branding Tab */}
                    <TabsContent value="branding" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Identidade Visual</CardTitle>
                                <CardDescription>
                                    Altere o nome da aplicação e as cores globais.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="app-name">Nome da Aplicação</Label>
                                    <Input
                                        id="app-name"
                                        value={appName}
                                        onChange={(e) => setAppName(e.target.value)}
                                        placeholder="Ex: Grove Leads CRM"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="primary-color">Cor Primária</Label>
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
                                    Salvar Branding
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Integrations Tab */}
                    <TabsContent value="integrations" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Integração n8n / Webhooks</CardTitle>
                                <CardDescription>
                                    Use a URL abaixo para enviar os leads de suas landing pages para este sistema.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Sua URL de Webhook</Label>
                                    <div className="flex gap-2">
                                        <Input readOnly value={webhookUrl} className="bg-muted" />
                                        <Button variant="secondary" onClick={copyToClipboard}>
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Envie um JSON POST para esta URL com campos como: nome, email, telefone e origem.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start gap-4">
                                <div className="text-sm border rounded-md p-4 bg-muted/50 w-full">
                                    <p className="font-semibold mb-2 flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4" /> Guia Rápido:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                        <li>Crie um workflow no n8n.</li>
                                        <li>Utilize o nó "HTTP Request".</li>
                                        <li>Configure o método como POST.</li>
                                        <li>Cole a URL acima no campo URL do nó.</li>
                                    </ol>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Permissions Tab */}
                    <TabsContent value="permissions" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Usuários e Permissões</CardTitle>
                                <CardDescription>
                                    Gerencie quem tem acesso ao painel de leads.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-md divide-y">
                                    <div className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">Administrador Principal</p>
                                            <p className="text-sm text-muted-foreground">admin@grovehub.com.br</p>
                                        </div>
                                        <Badge>Dono</Badge>
                                    </div>
                                    <div className="p-4 flex justify-between items-center text-muted-foreground opacity-50">
                                        <div>
                                            <p className="font-medium">Vendedor (Exemplo)</p>
                                            <p className="text-sm">comercial@cliente.com</p>
                                        </div>
                                        <Badge variant="outline">Visualizador</Badge>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" disabled>Adicionar Novo Usuário (Breve)</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </BlurFade>
        </div>
    );
}

// Badge Component Proxy for simple use here
function Badge({ children, variant = "default", className = "" }: any) {
    const variants: any = {
        default: "bg-primary text-primary-foreground text-xs",
        outline: "border text-foreground text-xs"
    };
    return (
        <span className={`px-2 py-0.5 rounded-full font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
