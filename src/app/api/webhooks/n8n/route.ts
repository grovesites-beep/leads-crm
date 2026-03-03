import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { ID } from "node-appwrite";

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("clientId");

        if (!clientId) {
            return NextResponse.json({
                success: false,
                error: "Parâmetro clientId é obrigatório na URL do webhook."
            }, { status: 400 });
        }

        const payload = await req.json();
        console.log(`Recebendo Lead para cliente ${clientId}:`, payload);

        const leadData = {
            clientId: clientId, // Vínculo essencial para o Multi-tenancy
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
            message: "Lead captado e vinculado ao cliente com sucesso",
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
