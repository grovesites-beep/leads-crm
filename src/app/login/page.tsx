"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BlurFade } from "@/components/magicui/blur-fade";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Sparkles, Loader2 } from "lucide-react";

import { LoginSchema } from "@/lib/validations/auth";
import { signIn, getPublicSettings } from "@/lib/appwrite/actions";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [appName, setAppName] = useState("Grove Leads CRM");

    useEffect(() => {
        async function loadSettings() {
            try {
                // Usar a nova função pública que não exige sessão
                const res = await getPublicSettings();
                if (res.success && res.settings?.appName) {
                    setAppName(res.settings.appName);
                }
            } catch (e) {
                console.error("Falha ao carregar branding:", e);
            }
        }
        loadSettings();
    }, []);

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
        setError(null);
        setIsPending(true);

        try {
            const response = await signIn(values.email, values.password);

            if (response && response.success) {
                // Forçar recarregamento completo para garantir inicialização da sessão
                window.location.href = "/dashboard";
            } else if (response && response.error) {
                setError(response.error);
                setIsPending(false);
            } else {
                setError("Erro inesperado no servidor. Tente novamente.");
                setIsPending(false);
            }
        } catch (err: any) {
            setError("Falha na conexão com o sistema.");
            setIsPending(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
            <div className="z-10 w-full max-w-md px-4">
                <BlurFade delay={0.25} inView className="flex flex-col items-center mb-8">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span className="font-medium">{appName}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-center">
                        Acessar Painel
                    </h1>
                    <p className="text-muted-foreground mt-2 text-center text-sm">
                        Gerencie seus parceiros e conecte seus leads
                    </p>
                </BlurFade>

                <BlurFade delay={0.5} inView>
                    <div className="bg-card w-full border rounded-2xl p-8 shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-black/80">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider opacity-60">Email de Acesso</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="seu@email.com.br"
                                                    type="email"
                                                    className="h-11 rounded-xl bg-muted/50 border-muted-foreground/10 focus:ring-primary/20"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider opacity-60">Senha</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="••••••••"
                                                    type="password"
                                                    className="h-11 rounded-xl bg-muted/50 border-muted-foreground/10 focus:ring-primary/20"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {error && (
                                    <div className="bg-destructive/10 text-destructive text-[13px] px-4 py-3 rounded-xl border border-destructive/20 font-medium">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    disabled={isPending}
                                    type="submit"
                                    className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isPending ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Autenticando...</span>
                                        </div>
                                    ) : "Entrar no Sistema"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </BlurFade>

            </div>

            <DotPattern
                width={24}
                height={24}
                cx={1}
                cy={1}
                cr={1}
                className="[mask-image:radial-gradient(450px_circle_at_center,white,transparent)] opacity-40"
            />
        </div>
    );
}
