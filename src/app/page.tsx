import { BlurFade } from "@/components/magicui/blur-fade";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="z-10 flex flex-col items-center text-center px-4">
        <BlurFade delay={0.25} inView>
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary mb-6">
            <Sparkles className="mr-2 h-4 w-4" />
            <span className="font-medium">Grove Leads CRM</span>
          </div>
        </BlurFade>

        <BlurFade delay={0.25 * 2} inView>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-3xl mb-6">
            Gerenciamento de Leads{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
              Inteligente
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.25 * 3} inView>
          <p className="max-w-[600px] text-muted-foreground md:text-xl mb-10">
            Acompanhe, gerencie e converta seus leads locais provenientes das suas Landing Pages automaticamente.
          </p>
        </BlurFade>

        <BlurFade delay={0.25 * 4} inView className="flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full px-8 hidden">
              Acessar Painel <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" className="rounded-full px-8 font-medium">
              Acessar Painel <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </BlurFade>
      </div>

      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      />
    </main>
  );
}
