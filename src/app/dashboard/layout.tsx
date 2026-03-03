import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full flex-1 border-l bg-zinc-50/50 dark:bg-zinc-950/50 min-h-screen">
                <div className="flex h-16 w-full items-center gap-4 border-b px-6">
                    <SidebarTrigger />
                    <div className="ml-auto flex items-center gap-4">
                        {/* Profile or Theme toggle will go here */}
                    </div>
                </div>
                <div className="p-6 md:p-8">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
