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
import { signOut, getLoggedInUser } from "@/lib/appwrite/actions"
import { useEffect, useState } from "react"

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            const data = await getLoggedInUser();
            setUser(data);
            setLoading(false);
        }
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    if (loading) return null;

    const isAdmin = user?.labels?.includes('admin') || user?.email === 'admin@grovehub.com.br'; // Fallback para admin inicial

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
                    show: !isAdmin // Clientes veem seus leads, admin vê clientes
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
                },
                {
                    title: "Integrações",
                    url: "/dashboard/settings",
                    icon: LinkIcon,
                }
            ],
        },
    ]

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
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {user?.name?.substring(0, 2).toUpperCase() || "AD"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-xs">
                                <span className="font-semibold">{user?.name || "Administrador"}</span>
                                <span className="text-muted-foreground">{user?.email || "admin@grovehub.com.br"}</span>
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
