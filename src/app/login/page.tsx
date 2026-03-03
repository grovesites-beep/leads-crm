"use client";

import { useState } from "react";
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
import { Sparkles } from "lucide-react";

import { LoginSchema } from "@/lib/validations/auth";
import { signIn, getSettings } from "@/lib/appwrite/actions";
import { useEffect } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [appName, setAppName] = useState("Grove Leads CRM");

    useEffect(() => {
        async function loadSettings() {
            const res = await getSettings();
            if (res.success && res.settings?.appName) {
                setAppName(res.settings.appName);
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

        const response = await signIn(values.email, values.password);

        if (response?.error) {
            setError(response.error);
            setIsPending(false);
        } else {
            router.push("/dashboard");
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
                    <p className="text-muted-foreground mt-2 text-center">
                        Gerencie seus leads e as conexões do sistema
                    </p>
                </BlurFade>

                <BlurFade delay={0.25 * 2} inView>
                    <div className="bg-card w-full border rounded-2xl p-6 shadow-sm">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="admin@grovehub.com.br"
                                                    type="email"
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
                                            <FormLabel>Senha</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="******"
                                                    type="password"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {error && (
                                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                        {error}
                                    </div>
                                )}

                                <Button disabled={isPending} type="submit" className="w-full">
                                    {isPending ? "Entrando..." : "Entrar"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </BlurFade>

            </div>

            <DotPattern
                width={20}
                height={20}
                cx={1}
                cy={1}
                cr={1}
                className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
            />
        </div>
    );
}
