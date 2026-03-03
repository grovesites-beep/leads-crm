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
        return await getAccount().get();
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

// --- LEADS ---

export async function getLeads() {
    try {
        const user = await getLoggedInUser();
        if (!user) throw new Error("Não autorizado");

        const { getDatabases } = await createSessionClient();
        const queries = [];

        // Se for cliente, filtrar apenas os leads dele
        if (user.labels?.includes('client')) {
            queries.push(Query.equal('clientId', user.$id));
        }

        const leads = await getDatabases().listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID!,
            queries
        );

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
