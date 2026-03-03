'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lead, StatusLead, LABEL_STATUS_LEAD } from '@/lib/tipos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { atualizarLead } from '@/lib/actions/leads';
import { toast } from 'sonner';
import { Save, Loader2, ClipboardEdit } from 'lucide-react';

interface FormularioEditarLeadProps {
    lead: Lead;
}

interface DadosFormulario {
    status: StatusLead;
    notas: string;
}

export function FormularioEditarLead({ lead }: FormularioEditarLeadProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const { control, register, handleSubmit } = useForm<DadosFormulario>({
        defaultValues: {
            status: lead.status,
            notas: lead.notas || '',
        },
    });

    const aoSubmeter = (dados: DadosFormulario) => {
        startTransition(async () => {
            const resultado = await atualizarLead(lead.$id, dados);
            if (resultado.sucesso) {
                toast.success('Lead atualizado com sucesso!');
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
                    <ClipboardEdit className="w-4 h-4 text-violet-400" />
                    Editar Lead
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(aoSubmeter)} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Status</Label>
                        <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0f0f1a] border-white/10">
                                        {(Object.entries(LABEL_STATUS_LEAD) as [StatusLead, string][]).map(([valor, rotulo]) => (
                                            <SelectItem key={valor} value={valor} className="text-slate-300 hover:text-white focus:text-white focus:bg-white/10">
                                                {rotulo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300 text-sm">Anotações</Label>
                        <Textarea
                            {...register('notas')}
                            placeholder="Adicione notas sobre este lead..."
                            rows={5}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-lg resize-none"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white gap-2 rounded-lg"
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</>
                        ) : (
                            <><Save className="w-4 h-4" />Salvar alterações</>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
