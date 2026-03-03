import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { Users, Webhook, MousePointerClick, TrendingUp } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
                <p className="text-muted-foreground">
                    Visão geral do desempenho das suas landing pages e captação de leads.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Total de Leads", value: "1,248", change: "+12.5%", icon: Users },
                    { title: "Leads (Este Mês)", value: "342", change: "+4.1%", icon: TrendingUp },
                    { title: "Taxa de Conversão", value: "8.2%", change: "+1.2%", icon: MousePointerClick },
                    { title: "Webhooks Ativos", value: "3", change: "0%", icon: Webhook },
                ].map((stat, i) => (
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
