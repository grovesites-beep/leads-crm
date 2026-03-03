import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { Users, Webhook, MousePointerClick, TrendingUp } from "lucide-react";
import { createSessionClient } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { getLoggedInUser } from "@/lib/appwrite/actions";

export default async function DashboardPage() {
    let stats = [
        { title: "Total de Leads", value: "0", change: "...", icon: Users },
        { title: "Leads (Este Mês)", value: "0", change: "...", icon: TrendingUp },
        { title: "Status Webhook", value: "Ativo", change: "Operacional", icon: Webhook },
        { title: "Conversão (Simulada)", value: "8.2%", change: "+1.2%", icon: MousePointerClick },
    ];

    try {
        const user = await getLoggedInUser();
        if (!user) return null;

        const { getDatabases } = await createSessionClient();
        const databases = getDatabases();

        const baseQueries: string[] = [];
        if (user.labels?.includes('client')) {
            baseQueries.push(Query.equal('clientId', user.$id));
        }

        // Buscar total de leads
        const leadsCount = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID!,
            [...baseQueries, Query.limit(0)]
        );

        // Buscar leads do mês atual
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const leadsMonth = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LEADS_COLLECTION_ID!,
            [
                ...baseQueries,
                Query.greaterThanEqual("$createdAt", firstDayOfMonth),
                Query.limit(0)
            ]
        );

        stats = [
            { title: "Total de Leads", value: leadsCount.total.toString(), change: "Até agora", icon: Users },
            { title: "Leads (Este Mês)", value: leadsMonth.total.toString(), change: "Mês atual", icon: TrendingUp },
            { title: "Status Webhook", value: "Ativo", change: "Operacional", icon: Webhook },
            { title: "Conversão (Simulada)", value: "8.2%", change: "+1.2%", icon: MousePointerClick },
        ];
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
                <p className="text-muted-foreground">
                    Visão geral do desempenho das suas landing pages e captação de leads.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <BlurFade key={i} delay={0.1 * i} inView>
                        <MagicCard className="flex flex-col p-6 shadow-sm border-neutral-200 dark:border-neutral-800" gradientColor="#D9D9D955">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <h2 className="text-3xl font-bold tracking-tight">{stat.value}</h2>
                                <span className="text-xs font-medium text-emerald-500">{stat.change}</span>
                            </div>
                        </MagicCard>
                    </BlurFade>
                ))}
            </div>
        </div>
    );
}
