'use client';

import { Moon, Sun } from 'lucide-react';
import { useTema } from '@/components/tema/ProvedorTema';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function BotaoToggleTema() {
    const { tema, alternarTema } = useTema();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={alternarTema}
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200"
                    aria-label={tema === 'claro' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
                >
                    {tema === 'claro' ? (
                        <Moon className="w-4 h-4" />
                    ) : (
                        <Sun className="w-4 h-4" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                {tema === 'claro' ? 'Modo Escuro' : 'Modo Claro'}
            </TooltipContent>
        </Tooltip>
    );
}
