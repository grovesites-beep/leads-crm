import { cookies } from "next/headers";
import { createSessionClient } from "./server";

export const SESSION_COOKIE = `a_session_${process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "groveinc"}`;

export async function createSessionClientDirectly() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);

    if (!session || !session.value) {
        throw new Error("Sessão ausente");
    }

    const { getAccount } = await createSessionClient();
    return getAccount();
}
