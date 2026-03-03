"use client"

import * as React from "react"
import {
    Users,
    LayoutDashboard,
    Settings,
    Building2,
    LogOut,
    Moon,
    Sun,
    Palette,
    Link as LinkIcon,
    User,
    Loader2
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
import { signOut, getLoggedInUser, getSettings } from "@/lib/appwrite/actions"
import { useEffect, useState } from "react"

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [userData, settingsData] = await Promise.all([
                    getLoggedInUser(),
                    getSettings()
                ]);
                setUser(userData);
                if (settingsData.success) setSettings(settingsData.settings);
            } catch (e) {
                console.error("Erro ao carregar sidebar:", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleLogout = async () => {
        await signOut();
        window.location.href = "/login";
    };

    const isAdmin = user?.labels?.includes('admin') ||
        user?.email?.toLowerCase() === 'admin@grovehub.com.br' ||
        user?.email?.toLowerCase() === 'nei@grovehub.com.br';

    const menuGroups = [
        {
            label: "Geral",
            items: [
                {
                    title: "Visão Geral",
                    url: "/dashboard",
                    icon: LayoutDashboard,
                    show: true
                },
                {
                    title: "Gestão de Clientes",
                    url: "/dashboard/clients",
                    icon: Building2,
                    show: isAdmin
                },
                {
                    title: "Leads Captados",
                    url: "/dashboard/leads",
                    icon: Users,
                    show: true // Mostrar para todos, as actions filtram o dado
                },
            ].filter(i => i.show),
        },
        {
            label: "Sistema",
            items: [
                {
                    title: "Configurações",
                    url: "/dashboard/settings",
                    icon: Settings,
                }
            ],
        },
    ]

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r">
            <SidebarHeader className="flex h-16 items-center border-b px-6">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                    <div className="bg-primary text-primary-foreground rounded-lg p-1">
                        <Palette className="h-5 w-5" />
                    </div>
                    <span className="truncate">{settings?.appName || "Grove CRM"}</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="py-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Carregando...</span>
                    </div>
                ) : (
                    menuGroups.map((group) => (
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
                    ))
                )}
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter className="p-4">
                {loading ? (
                    <div className="h-12 w-full bg-muted animate-pulse rounded-xl" />
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="lg" className="h-12 w-full justify-start gap-3 px-2 transition-all hover:bg-accent/50 rounded-xl">
                                <Avatar className="h-8 w-8 rounded-lg border">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {user?.name?.substring(0, 2).toUpperCase() || "UN"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start text-xs truncate">
                                    <span className="font-semibold truncate w-full text-left">{user?.name || "Usuário"}</span>
                                    <span className="text-muted-foreground truncate w-full text-left">{user?.email || "carregando..."}</span>
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
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings">
                                    <User className="mr-2 h-4 w-4" /> Meus Dados
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}
