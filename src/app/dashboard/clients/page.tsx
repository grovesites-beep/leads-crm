"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Building2, Mail, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient, getClients } from "@/lib/appwrite/actions";
import { toast } from "sonner";

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        const res = await getClients();
        if (res.success) {
            setClients(res.clients || []);
        }
        setLoading(false);
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        const res = await createClient({ name, email, password });
        if (res.success) {
            toast.success("Cliente criado com sucesso!");
            setIsDialogOpen(false);
            setName("");
            setEmail("");
            setPassword("");
            fetchClients();
        } else {
            toast.error("Erro: " + res.error);
        }
        setIsCreating(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
                    <p className="text-muted-foreground">
                        Cadastre e gerencie os acessos dos seus clientes à plataforma.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleCreateClient}>
                            <DialogHeader>
                                <DialogTitle>Adicionar Cliente</DialogTitle>
                                <DialogDescription>
                                    O cliente receberá um login de acesso exclusivo para ver seus próprios leads.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome da Empresa / Cliente</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-mail de Acesso</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Senha Inicial</Label>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Criar Acesso
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : clients.length > 0 ? (
                    clients.map((client, i) => (
                        <BlurFade key={client.$id} delay={0.1 * i} inView>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-bold">{client.name}</CardTitle>
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" /> {client.email}
                                        </div>
                                        <div className="flex flex-col gap-1 mt-2">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Webhook ID</span>
                                            <code className="text-xs bg-muted p-1 rounded truncate">{client.userId}</code>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                                                Configurar
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </BlurFade>
                    ))
                ) : (
                    <div className="col-span-full text-center py-24 border-2 border-dashed rounded-xl border-muted">
                        <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
