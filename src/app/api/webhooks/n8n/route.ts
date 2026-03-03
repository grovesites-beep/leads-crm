import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { ID } from "node-appwrite";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        console.log("Recebendo Lead do Webhook:", payload);

        // Mapeamento dos campos vindo do n8n/form
        // Ajuste conforme o formato que o n8n envia
        const leadData = {
            name: payload.nome || payload.name || "Sem Nome",
            email: payload.email || "sem@email.com",
            phone: payload.telefone || payload.phone || "",
            source: payload.origem || payload.source || "Webhook",
            status: "new",
        };

        const { getDatabases } = await createAdminClient();
        const databases = getDatabases();

        const response = await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID!,
            ID.unique(),
            leadData
        );

        return NextResponse.json({
            success: true,
            message: "Lead captado com sucesso",
            id: response.$id
        }, { status: 201 });

    } catch (error: any) {
        console.error("Erro no Webhook:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
