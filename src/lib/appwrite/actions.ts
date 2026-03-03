"use server"

import { ID } from "node-appwrite";
import { createAdminClient } from "./server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./auth";

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
    try {
        const { getAccount } = await createAdminClient(); // Usamos admin ou instanciamos sessão, aqui para deslogar do cookie.

        (await cookies()).delete(SESSION_COOKIE);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
