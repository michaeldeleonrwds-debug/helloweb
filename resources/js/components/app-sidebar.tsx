import { NavUser } from '@/components/nav-user';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Boxes,
    FileText,
    Globe,
    Image,
    LayoutGrid,
    Plus,
    Settings2,
    Shapes,
    Sparkles,
} from 'lucide-react';
import AppLogo from './app-logo';

const menuNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: route('dashboard'),
        icon: LayoutGrid,
    },
    { title: 'Websites', url: route('websites.index'), icon: Boxes },
    { title: 'Pages', url: route('pages.index'), icon: FileText },
    { title: 'Templates', url: route('templates.index'), icon: Shapes },
    { title: 'Media Library', url: route('media.index'), icon: Image },
    { title: 'Reusable Blocks', url: route('reusable-components.index'), icon: Sparkles },
];

const generalNavItems: NavItem[] = [
    {
        title: 'Settings',
        url: '/settings/profile',
        icon: Settings2,
    },
    {
        title: 'Website Settings',
        url: '/settings/website',
        icon: Globe,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-neutral-200/70 bg-white">
            <SidebarHeader className="px-4 py-4 border-b border-neutral-100">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-neutral-50 rounded-xl transition">
                            <Link href="/dashboard" prefetch className="flex items-center gap-2.5">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-3 py-3">
                {/* Primary Action Button (Reference: + Add Project / Launch Builder) */}
                <div className="px-4 group-data-[collapsible=icon]:hidden">
                    <Link
                        href="/builder"
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground shadow-sm transition hover:brightness-105 active:scale-[0.98]"
                    >
                        <Plus className="size-4 stroke-[2.5]" />
                        <span>Launch Builder</span>
                    </Link>
                </div>

                {/* Main Menu Navigation */}
                <NavMain items={menuNavItems} label="MENU" />

                {/* General Navigation */}
                <NavMain items={generalNavItems} label="GENERAL" />

                {/* Studio Promo Card (Reference: Bottom dark green mobile app card) */}
                <div className="mt-auto px-4 group-data-[collapsible=icon]:hidden">
                    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#134E35] via-[#154D34] to-[#0A2E1F] p-4 text-white shadow-sm">
                        {/* Organic decorative rings */}
                        <div className="absolute -top-8 -right-8 size-28 rounded-full border border-white/10" />
                        <div className="absolute -top-4 -right-4 size-20 rounded-full border border-white/15" />

                        <div className="relative z-10 space-y-2.5">
                            <div className="flex items-center gap-2">
                                <div className="flex size-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-xs text-white">
                                    <Sparkles className="size-3.5" />
                                </div>
                                <span className="text-xs font-bold text-white tracking-tight">Visual Studio</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-emerald-100/80">
                                Create and publish fast, responsive pages with ease.
                            </p>
                            <Link
                                href="/builder"
                                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white/95 hover:bg-white py-1.5 px-3 text-xs font-bold text-[#134E35] shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <span>Open Builder</span>
                                <ArrowRight className="size-3 stroke-[2.5]" />
                            </Link>
                        </div>
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-neutral-100 p-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
