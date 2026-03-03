'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { atualizarCliente } from '@/lib/actions/clientes';
import { toast } from 'sonner';
import { Palette, Loader2, Save } from 'lucide-react';

interface FormularioBrandingProps {
    clienteId: string;
    corAtual: string;
}

const CORES_PREDEFINIDAS = [
    '#7c3aed', '#6366f1', '#3b82f6', '#06b6d4',
    '#10b981', '#f59e0b', '#ef4444', '#ec4899',
];

export function FormularioBranding({ clienteId, corAtual }: FormularioBrandingProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: { brandingCorPrimaria: corAtual },
    });

    const corSelecionada = watch('brandingCorPrimaria');

    const aoSubmeter = (dados: { brandingCorPrimaria: string }) => {
        startTransition(async () => {
            const resultado = await atualizarCliente(clienteId, { brandingCorPrimaria: dados.brandingCorPrimaria });
            if (resultado.sucesso) {
                toast.success('Branding atualizado!');
                router.refresh();
            } else {
                toast.error(resultado.erro);
            }
        });
    };

    return (
        <Card className="bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                    <Palette className="w-5 h-5 text-violet-400" />
                    Personalização Visual
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(aoSubmeter)} className="space-y-6">
                    {/* Preview do sidebar */}
                    <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                        <p className="text-slate-500 text-xs mb-3">Pré-visualização</p>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${corSelecionada}, ${corSelecionada}99)` }}
                            >
                                <span className="text-white text-xs font-bold">L</span>
                            </div>
                            <span className="text-white text-sm font-medium">LeadsCRM</span>
                        </div>
                    </div>

                    {/* Cores predefinidas */}
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Cor Primária</Label>
                        <div className="flex flex-wrap gap-2">
                            {CORES_PREDEFINIDAS.map((cor) => (
                                <button
                                    key={cor}
                                    type="button"
                                    onClick={() => setValue('brandingCorPrimaria', cor)}
                                    className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                                    style={{ backgroundColor: cor, outline: corSelecionada === cor ? `2px solid ${cor}` : 'none', outlineOffset: '2px' }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Cor customizada */}
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Ou escolha uma cor personalizada</Label>
                        <div className="flex gap-3 items-center">
                            <Input
                                type="color"
                                value={corSelecionada}
                                onChange={(e) => setValue('brandingCorPrimaria', e.target.value)}
                                className="w-12 h-12 p-1 rounded-lg border-white/10 bg-white/5 cursor-pointer"
                            />
                            <Input
                                {...register('brandingCorPrimaria')}
                                placeholder="#7c3aed"
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 font-mono"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white gap-2"
                    >
                        {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : <><Save className="w-4 h-4" />Salvar branding</>}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
