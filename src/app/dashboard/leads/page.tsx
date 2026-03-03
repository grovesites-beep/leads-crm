import { createAdminClient } from "@/lib/appwrite/server";
import { LeadsDataTable, Lead } from "@/components/leads/data-table";
import { Query } from "node-appwrite";
import { BlurFade } from "@/components/magicui/blur-fade";

export const dynamic = "force-dynamic";

async function getLeads(): Promise<Lead[]> {
    try {
        const { getDatabases } = await createAdminClient();
        const databases = getDatabases();

        const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID!,
            [Query.orderDesc("$createdAt")]
        );

        return response.documents as unknown as Lead[];
    } catch (error) {
        console.error("Erro ao carregar leads:", error);
        return [];
    }
}

export default async function LeadsPage() {
    const leads = await getLeads();

    return (
        <div className="flex flex-col gap-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Leads Captados</h1>
                    <p className="text-muted-foreground">
                        Gerencie e visualize todos os contatos captados através das suas landing pages.
                    </p>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <LeadsDataTable data={leads} />
            </BlurFade>
        </div>
    );
}
