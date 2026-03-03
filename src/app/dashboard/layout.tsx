"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/appwrite/actions"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const handleLogout = async () => {
        await signOut();
        window.location.href = "/login";
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full flex-1 border-l bg-zinc-50/50 dark:bg-zinc-950/50 min-h-screen">
                <div className="flex h-16 w-full items-center gap-4 border-b px-6 bg-white dark:bg-black sticky top-0 z-30">
                    <SidebarTrigger />
                    <div className="ml-auto flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive flex items-center gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Encerrar Sessão</span>
                        </Button>
                    </div>
                </div>
                <div className="p-6 md:p-8">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
