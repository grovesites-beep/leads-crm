"use client";

import { BlurFade } from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
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
import { Plus, Building2, Mail, Loader2, Trash2, Edit2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient, getClients, getLoggedInUser, deleteClient, updateClient } from "@/lib/appwrite/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Edit state
    const [editingClient, setEditingClient] = useState<any>(null);

    useEffect(() => {
        async function checkAdmin() {
            const user = await getLoggedInUser();
            const isAdmin = user?.labels?.includes('admin') ||
                user?.email === 'admin@grovehub.com.br' ||
                user?.email === 'nei@grovehub.com.br';

            if (!isAdmin) {
                router.push("/dashboard");
                return;
            }
            fetchClients();
        }
        checkAdmin();
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
            resetForm();
            fetchClients();
        } else {
            toast.error("Erro: " + res.error);
        }
        setIsCreating(false);
    };

    const handleUpdateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClient) return;

        setIsCreating(true);
        const res = await updateClient(editingClient.$id, { name });
        if (res.success) {
            toast.success("Cliente atualizado!");
            setEditingClient(null);
            resetForm();
            fetchClients();
        } else {
            toast.error("Erro: " + res.error);
        }
        setIsCreating(false);
    };

    const handleDeleteClient = async (clientId: string, userId: string) => {
        if (!confirm("⚠️ ATENÇÃO: Isso excluirá permanentemente o acesso do cliente e seus dados. Continuar?")) return;

        setIsDeleting(clientId);
        const res = await deleteClient(clientId, userId);
        if (res.success) {
            toast.success("Cliente removido do sistema.");
            fetchClients();
        } else {
            toast.error("Erro ao deletar: " + res.error);
        }
        setIsDeleting(null);
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
    };

    const openEdit = (client: any) => {
        setEditingClient(client);
        setName(client.name);
        setEmail(client.email);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Centro de Controle - Clientes</h1>
                    <p className="text-muted-foreground">
                        Gestão total de parceiros, acessos e vinculação de leads.
                    </p>
                </div>

                <Dialog open={isDialogOpen || !!editingClient} onOpenChange={(open) => {
                    if (!open) {
                        setIsDialogOpen(false);
                        setEditingClient(null);
                        resetForm();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2" onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4" /> Novo Cliente
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={editingClient ? handleUpdateClient : handleCreateClient}>
                            <DialogHeader>
                                <DialogTitle>{editingClient ? "Editar Cliente" : "Adicionar Novo Parceiro"}</DialogTitle>
                                <DialogDescription>
                                    Crie ou modifique os dados de acesso do cliente à plataforma Grove.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome da Empresa</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-mail (Login)</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!editingClient} />
                                </div>
                                {!editingClient && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Senha Inicial</Label>
                                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingClient ? "Salvar Alterações" : "Gerar Acesso"}
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
                            <Card className="hover:shadow-lg transition-all border-l-4 border-l-primary">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-bold truncate pr-4">{client.name}</CardTitle>
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                        <Building2 className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                                            <Mail className="h-4 w-4" /> {client.email}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => openEdit(client)}>
                                                <Edit2 className="h-3.5 w-3.5" /> Editar
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => handleDeleteClient(client.$id, client.userId)}
                                                disabled={isDeleting === client.$id}
                                            >
                                                {isDeleting === client.$id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                                Excluir
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </BlurFade>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl bg-muted/30">
                        <ShieldAlert className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-medium">Nenhum parceiro ativo no sistema.</p>
                        <Button variant="link" onClick={() => setIsDialogOpen(true)}>Cadastrar primeiro agora</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
