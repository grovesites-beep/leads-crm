"use server"

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "./server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./auth";
import { redirect } from "next/navigation";

// --- AUTH & SESSION ---

export async function getLoggedInUser() {
    try {
        const { getAccount } = await createSessionClient();
        const user = await getAccount().get();
        if (!user) return null;

        // Buscar labels via Admin API (labels não vêm no getAccount().get())
        const { getUsers } = await createAdminClient();
        const userData = await getUsers().get(user.$id);

        return {
            ...user,
            labels: userData.labels || []
        };
    } catch (error) {
        return null;
    }
}

export async function signIn(email: string, password: string) {
    try {
        const { getAccount } = await createAdminClient();
        const account = getAccount();

        const session = await account.createEmailPasswordSession(email, password);

        (await cookies()).set(SESSION_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            expires: new Date(session.expire)
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function signOut() {
    const session = (await cookies()).get(SESSION_COOKIE);
    if (session) {
        try {
            const { getAccount } = await createSessionClient();
            await getAccount().deleteSession('current');
        } catch (error) { }
    }
    (await cookies()).delete(SESSION_COOKIE);
    redirect("/login");
}

// --- CLIENT MANAGEMENT (ADMIN ONLY) ---

export async function createClient(data: { name: string, email: string, password: string }) {
    try {
        const { getUsers, getDatabases } = await createAdminClient();

        // 1. Criar Usuário no Auth
        const newUser = await getUsers().create(ID.unique(), data.email, undefined, data.password, data.name);

        // 2. Adicionar Label 'client'
        await getUsers().updateLabels(newUser.$id, ['client']);

        // 3. Criar Documento na Coleção de Clientes
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

        // 1. Deletar do Banco
        await getDatabases().deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_CLIENTS_COLLECTION_ID!,
            clientId
        );

        // 2. Deletar do Auth
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


// --- SYSTEM SETTINGS ---

export async function updateSettings(data: { appName: string, primaryColor: string }) {
    try {
        const { getDatabases } = await createSessionClient();
        const databases = getDatabases();

        await databases.updateDocument(
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

export async function getSettings() {
    try {
        const { getDatabases } = await createSessionClient();
        const databases = getDatabases();

        const settings = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_SYSTEM_COLLECTION_ID!,
            'global'
        );
        return { success: true, settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- LEADS ---

export async function getLeads() {
    try {
        const user = await getLoggedInUser();
        if (!user) throw new Error("Não autorizado");

        const { getDatabases } = await createSessionClient();
        const queries = [Query.orderDesc("$createdAt")];

        const isAdmin = user.labels?.includes('admin') ||
            user.email?.toLowerCase() === 'admin@grovehub.com.br' ||
            user.email?.toLowerCase() === 'nei@grovehub.com.br';

        // Se for cliente, filtrar apenas os leads dele
        if (!isAdmin) {
            queries.push(Query.equal('clientId', user.$id));
        }

        const leads = await getDatabases().listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID!,
            queries
        );

        // Se for admin, vamos tentar anexar o nome do cliente para visualização
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
