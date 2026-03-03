import { LeadsDataTable, Lead } from "@/components/leads/data-table";
import { BlurFade } from "@/components/magicui/blur-fade";
import { getLeads } from "@/lib/appwrite/actions";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
    const res = await getLeads();
    const leads = (res.success ? res.leads : []) as unknown as Lead[];

    return (
        <div className="flex flex-col gap-6">
            <BlurFade delay={0.1} inView>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Leads Captados</h1>
                    <p className="text-muted-foreground">
                        Visualize e gerencie os contatos exclusivos da sua conta.
                    </p>
                </div>
            </BlurFade>

            <BlurFade delay={0.2} inView>
                <LeadsDataTable data={leads} />
            </BlurFade>
        </div>
    );
}
