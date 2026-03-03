"use server"

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "./server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./auth";
import { redirect } from "next/navigation";


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

export async function updateSettings(data: { appName: string, primaryColor: string }) {
    try {
        const { getDatabases } = await createSessionClient();
        const databases = getDatabases();

        await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID!,
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
            process.env.NEXT_PUBLIC_APPWRITE_SETTINGS_COLLECTION_ID!,
            'global'
        );
        return { success: true, settings };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteLead(leadId: string) {
    try {
        const { getDatabases } = await createSessionClient();
        const databases = getDatabases();

        await databases.deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID!,
            leadId
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
