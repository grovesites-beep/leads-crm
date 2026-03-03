"use client"

import * as React from "react"
import {
    Users,
    LayoutDashboard,
    Settings,
    ChevronRight,
    LogOut,
    Moon,
    Sun,
    Palette,
    ShieldCheck,
    Link as LinkIcon,
    User
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/appwrite/actions"

const menuGroups = [
    {
        label: "Geral",
        items: [
            {
                title: "Visão Geral",
                url: "/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Leads Captados",
                url: "/dashboard/leads",
                icon: Users,
            },
        ],
    },
    {
        label: "Sistema",
        items: [
            {
                title: "Configurações",
                url: "/dashboard/settings",
                icon: Settings,
            },
            {
                title: "Integrações",
                url: "/dashboard/settings", // Link interno filtrado ou mesma página com tabs
                icon: LinkIcon,
            }
        ],
    },
]

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader className="flex h-16 items-center border-b px-6">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                    <div className="bg-primary text-primary-foreground rounded-lg p-1">
                        <Palette className="h-5 w-5" />
                    </div>
                    <span>Grove CRM</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="py-2">
                {menuGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel className="px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.url}
                                            className="px-6 h-10 transition-all hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span className="font-medium">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="h-12 w-full justify-start gap-3 px-2 transition-all hover:bg-accent/50 rounded-xl">
                            <Avatar className="h-8 w-8 rounded-lg border">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-xs">
                                <span className="font-semibold">Administrador</span>
                                <span className="text-muted-foreground">admin@grovehub.com.br</span>
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start" side="right" sideOffset={10}>
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                            Alternar Tema
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" /> Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" /> Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
