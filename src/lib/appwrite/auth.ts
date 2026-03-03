import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "./server";
import { Account, ID } from "node-appwrite";

export const SESSION_COOKIE = "my-custom-session";

export async function createSessionClientDirectly() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);

    if (!session || !session.value) {
        throw new Error("No session");
    }

    const { getAccount } = await createSessionClient();
    return getAccount();
}

export async function getLoggedInUser() {
    try {
        const { getAccount } = await createSessionClient();
        const account = getAccount();
        return await account.get();
    } catch (error) {
        return null;
    }
}
