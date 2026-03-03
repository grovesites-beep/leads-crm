import { Client, Account, Databases, Storage, Users } from 'node-appwrite';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from './auth';

export async function createSessionClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const session = (await cookies()).get(SESSION_COOKIE);
    if (!session || !session.value) {
        throw new Error("No session");
    }

    client.setSession(session.value);

    return {
        getAccount: () => new Account(client),
        getDatabases: () => new Databases(client),
        getStorage: () => new Storage(client)
    };
}

export const createAdminClient = async () => {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setKey(process.env.APPWRITE_API_KEY!);

    return {
        getAccount: () => new Account(client),
        getDatabases: () => new Databases(client),
        getStorage: () => new Storage(client),
        getUsers: () => new Users(client)
    };
};
