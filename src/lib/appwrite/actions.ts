"use server"

import { ID, Query, Client, Account } from "node-appwrite";
import { createAdminClient, createSessionClient } from "./server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE } from "./auth";

// --- AUTH & SESSION ---

export async function getLoggedInUser() {
    try {
        const { getAccount } = await createSessionClient();
        const user = await getAccount().get();
        if (!user) return null;

        // Tentar obter etiquetas admin de forma segura
        try {
            const { getUsers } = await createAdminClient();
            const userData = await getUsers().get(user.$id);
            return {
                ...user,
                labels: userData.labels || []
            };
        } catch (e) {
            return { ...user, labels: [] };
        }
    } catch (error) {
        return null; // Apenas silencia e deixa o dashboard decidir se redireciona
    }
}

export async function signIn(email: string, password: string) {
    try {
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
        const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

        if (!endpoint || !project) throw new Error("Configuração Appwrite faltando.");

        const client = new Client()
            .setEndpoint(endpoint)
            .setProject(project);

        const account = new Account(client);

        const session = await account.createEmailPasswordSession(email, password);

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            expires: new Date(session.expire)
        });

        // Revalidar apenas o dashboard em vez da raiz total
        try {
            revalidatePath('/dashboard');
        } catch (e) { }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function signOut() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get(SESSION_COOKIE);
        if (session) {
            const { getAccount } = await createSessionClient();
            await getAccount().deleteSession('current');
        }
        cookieStore.delete(SESSION_COOKIE);
    } catch (error) { }
}

// --- CLIENT MANAGEMENT ---

export async function createClient(data: { name: string, email: string, password: string }) {
    try {
        const { getUsers, getDatabases } = await createAdminClient();

        const newUser = await getUsers().create(ID.unique(), data.email, undefined, data.password, data.name);
        await getUsers().updateLabels(newUser.$id, ['client']);

        await getDatabases().createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_CLIENTS_COLLECTION_ID!,
            ID.unique(),
            {
                name: data.name,
                email: data.email,
                userId: newUser.$id,
                slug: data.name.toLowerCase().replace(/ /g, '-'),
                branding: JSON.stringify({ primaryColor: "#000000" })
            }
        );

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getClients() {
    try {
        const { getDatabases } = await createSessionClient();
        const clients = await getDatabases().listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_CLIENTS_COLLECTION_ID!
        );
        return { success: true, clients: clients.documents };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteClient(clientId: string, userId: string) {
    try {
        const { getDatabases, getUsers } = await createAdminClient();

        await getDatabases().deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_CLIENTS_COLLECTION_ID!,
            clientId
        );

        await getUsers().delete(userId);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateClient(clientId: string, data: { name: string }) {
    try {
        const { getDatabases } = await createAdminClient();
        await getDatabases().updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_CLIENTS_COLLECTION_ID!,
            clientId,
            { name: data.name }
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- SETTINGS & LEADS ---

export async function getPublicSettings() {
    try {
        const { getDatabases } = await createAdminClient();
        const settings = await getDatabases().getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_SYSTEM_COLLECTION_ID!,
            'global'
        );
        return { success: true, settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getSettings() {
    try {
        const { getDatabases } = await createSessionClient();
        const settings = await getDatabases().getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_SYSTEM_COLLECTION_ID!,
            'global'
        );
        return { success: true, settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSettings(data: { appName: string, primaryColor: string }) {
    try {
        const { getDatabases } = await createSessionClient();
        await getDatabases().updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_SYSTEM_COLLECTION_ID!,
            'global',
            data
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getLeads() {
    try {
        const user = await getLoggedInUser();
        if (!user) throw new Error("Sessão expirada. Faça login novamente.");

        const { getDatabases } = await createSessionClient();
        const queries = [Query.orderDesc("$createdAt")];

        const emailLower = user.email?.toLowerCase().trim() || "";
        const isAdmin = user.labels?.includes('admin') ||
            emailLower === 'admin@grovehub.com.br' ||
            emailLower === 'nei@grovehub.com.br';

        if (!isAdmin) {
            queries.push(Query.equal('clientId', user.$id));
        }

        const leads = await getDatabases().listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID!,
            queries
        );

        if (isAdmin) {
            const clientsRes = await getClients();
            if (clientsRes.success && clientsRes.clients) {
                const clientMap = new Map(clientsRes.clients.map((c: any) => [c.userId, c.name]));
                const enrichedLeads = leads.documents.map((lead: any) => ({
                    ...lead,
                    clientName: clientMap.get(lead.clientId) || "Admin / Geral"
                }));
                return { success: true, leads: enrichedLeads };
            }
        }

        return { success: true, leads: leads.documents };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteLead(leadId: string) {
    try {
        const { getDatabases } = await createSessionClient();
        await getDatabases().deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID!,
            leadId
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
