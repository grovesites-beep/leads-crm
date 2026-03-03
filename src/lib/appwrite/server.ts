import { Client, Account, Databases, Storage, Users } from 'node-appwrite';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from './auth';

export async function createSessionClient() {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

    if (!endpoint || !project) {
        throw new Error("Appwrite environment variables are missing.");
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(project);

    const session = (await cookies()).get(SESSION_COOKIE);
    console.log(`Buscando cookie ${SESSION_COOKIE}... ${session ? "ENCONTRADO" : "AUSENTE"}`);

    if (!session || !session.value) {
        throw new Error(`Sessão não encontrada no cookie ${SESSION_COOKIE}`);
    }

    client.setSession(session.value);

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
        throw new Error("Appwrite environment variables are missing.");
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
