'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Tema = 'claro' | 'escuro';

interface ContextoTema {
    tema: Tema;
    alternarTema: () => void;
}

const ContextoTema = createContext<ContextoTema>({
    tema: 'claro',
    alternarTema: () => { },
});

export function ProvedorTema({ children }: { children: React.ReactNode }) {
    const [tema, setTema] = useState<Tema>('claro');

    useEffect(() => {
        // Lê o tema salvo ou usa 'claro' como padrão
        const temaSalvo = (localStorage.getItem('tema') as Tema) || 'claro';
        setTema(temaSalvo);
        aplicarTema(temaSalvo);
    }, []);

    const aplicarTema = (novoTema: Tema) => {
        const html = document.documentElement;
        if (novoTema === 'escuro') {
            html.classList.add('dark');
            html.setAttribute('data-tema', 'escuro');
        } else {
            html.classList.remove('dark');
            html.setAttribute('data-tema', 'claro');
        }
    };

    const alternarTema = () => {
        const novoTema: Tema = tema === 'claro' ? 'escuro' : 'claro';
        setTema(novoTema);
        aplicarTema(novoTema);
        localStorage.setItem('tema', novoTema);
    };

    return (
        <ContextoTema.Provider value={{ tema, alternarTema }}>
            {children}
        </ContextoTema.Provider>
    );
}

export function useTema() {
    return useContext(ContextoTema);
}
