'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedGradientText, BlurFade, BorderBeam } from '@/components/magic-ui';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';

const esquemaLogin = z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type FormularioLogin = z.infer<typeof esquemaLogin>;

export default function PaginaLogin() {
    const router = useRouter();
    const [exibirSenha, setExibirSenha] = useState(false);
    const [isPending, startTransition] = useTransition();

    const { register, handleSubmit, formState: { errors } } = useForm<FormularioLogin>({
        resolver: zodResolver(esquemaLogin),
    });

    const aoSubmeterFormulario = (dados: FormularioLogin) => {
        startTransition(async () => {
            try {
                // Usa a API Route server-side para evitar CORS (sem necessidade de plataforma Appwrite)
                const resposta = await fetch('/api/autenticar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: dados.email, senha: dados.senha }),
                });

                const resultado = await resposta.json();

                if (resultado.sucesso) {
                    toast.success('Login realizado com sucesso!');
                    router.push(resultado.redirecionarPara);
                } else {
                    toast.error(resultado.erro || 'Erro ao fazer login.');
                }
            } catch {
                toast.error('Erro de conexão. Tente novamente.');
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#080810] overflow-hidden relative">
            {/* Fundo com gradiente animado */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px] animate-pulse [animation-delay:2s]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse [animation-delay:4s]" />
            </div>

            {/* Grade decorativa */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Header */}
                <BlurFade delay={0.1}>
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">L</span>
                            </div>
                            <AnimatedGradientText className="text-2xl font-bold">
                                LeadsCRM
                            </AnimatedGradientText>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Gerencie seus leads com inteligência
                        </p>
                    </div>
                </BlurFade>

                {/* Card de Login */}
                <BlurFade delay={0.2}>
                    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                        <BorderBeam size={200} duration={8} colorFrom="#7c3aed" colorTo="#06b6d4" />

                        <div className="mb-6">
                            <h1 className="text-white text-xl font-semibold mb-1">
                                Bem-vindo de volta
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Entre com suas credenciais para acessar o painel
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(aoSubmeterFormulario)} className="space-y-5">
                            {/* Campo E-mail */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                                    E-mail
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        autoComplete="email"
                                        {...register('email')}
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-11"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-400 text-xs">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Campo Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="senha" className="text-slate-300 text-sm font-medium">
                                    Senha
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="senha"
                                        type={exibirSenha ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        {...register('senha')}
                                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl h-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setExibirSenha(!exibirSenha)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {exibirSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.senha && (
                                    <p className="text-red-400 text-xs">{errors.senha.message}</p>
                                )}
                            </div>

                            {/* Botão de Login */}
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-11 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar no Painel'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <p className="text-slate-500 text-xs">
                                Problemas para acessar? Entre em contato com o administrador.
                            </p>
                        </div>
                    </div>
                </BlurFade>

                {/* Footer com ano dinâmico */}
                <BlurFade delay={0.4}>
                    <p className="text-center text-slate-600 text-xs mt-6">
                        © {new Date().getFullYear()} LeadsCRM · Todos os direitos reservados
                    </p>
                </BlurFade>
            </div>
        </div>
    );
}
