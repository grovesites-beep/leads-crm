"use server"

import { Client, Account, Databases, Storage, Users } from 'node-appwrite';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from './auth';

export async function createSessionClient() {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

    if (!endpoint || !project) {
        throw new Error("Variáveis de ambiente do Appwrite faltando.");
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(project);

    try {
        const cookieStore = await cookies();
        const session = cookieStore.get(SESSION_COOKIE);

        if (session && session.value) {
            client.setSession(session.value);
        } else {
            // Se não houver cookie, não throw erro aqui, apenas devolva o cliente sem sessão
            // getLoggedInUser lidará com a falta de dados
        }
    } catch (e) {
        // Silenciar erro de acesso a cookies em ambientes de build
    }

    return {
        getAccount: () => new Account(client),
        getDatabases: () => new Databases(client),
        getStorage: () => new Storage(client)
    };
}

export const createAdminClient = async () => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const key = process.env.APPWRITE_API_KEY;

    if (!endpoint || !project || !key) {
        throw new Error("Chave de API do Appwrite faltando.");
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(project)
        .setKey(key);

    return {
        getAccount: () => new Account(client),
        getDatabases: () => new Databases(client),
        getStorage: () => new Storage(client),
        getUsers: () => new Users(client)
    };
};
