import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Boxes, FileText, Image, LayoutGrid, Plus, Settings2, Shapes, Sparkles } from 'lucide-react';
import AppLogo from './app-logo';

const workspaceNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: route('dashboard'),
        icon: LayoutGrid,
    },
    { title: 'Websites', url: route('websites.index'), icon: Boxes },
    { title: 'Pages', url: route('pages.index'), icon: FileText },
];

const designNavItems: NavItem[] = [
    { title: 'Templates', url: route('templates.index'), icon: Shapes },
    { title: 'Media Library', url: route('media.index'), icon: Image },
    { title: 'Reusable blocks', url: route('reusable-components.index'), icon: Sparkles },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        url: '/settings/profile',
        icon: Settings2,
    },
];

export function AppSidebar() {
    const page = usePage();
    const pathname = new URL(page.url, window.location.origin).pathname;

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-border/80">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-muted/50 transition">
                            <Link href="/dashboard" prefetch className="flex items-center gap-2.5">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-2 px-2 py-2">
                {/* Quick Builder Launch */}
                <div className="px-2 py-1.5 group-data-[collapsible=icon]:hidden">
                    <Link
                        href="/builder"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 px-3 text-xs font-semibold text-primary-foreground shadow-xs transition hover:brightness-105 active:scale-[0.98]"
                    >
                        <Plus className="size-3.5 stroke-[2.5]" />
                        <span>Launch Builder</span>
                    </Link>
                </div>

                {/* Workspace Group */}
                <NavMain items={workspaceNavItems} />

                {/* Design & Assets Group */}
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Design Assets
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {designNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith(new URL(item.url, window.location.origin).pathname)}
                                    className="rounded-md transition text-muted-foreground hover:text-foreground"
                                >
                                    <Link href={item.url} prefetch>
                                        {item.icon && <item.icon className="size-4" />}
                                        <span className="font-medium text-xs">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
