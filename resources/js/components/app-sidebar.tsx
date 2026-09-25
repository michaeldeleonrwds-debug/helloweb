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
    Boxes,
    FileText,
    Globe,
    Image,
    LayoutGrid,
    Plus,
    Settings2,
    Shapes,
    Sparkles,
    UploadCloud,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';
import { ImportModal } from '@/components/ImportModal';

export function AppSidebar() {
    const [importModalOpen, setImportModalOpen] = useState(false);

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
        {
            title: 'Import',
            url: '#',
            icon: UploadCloud,
            onClick: () => setImportModalOpen(true),
        },
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
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl transition">
                            <Link href="/dashboard" prefetch className="flex items-center gap-2.5">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-3 py-3">
                {/* Primary Action Button */}
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
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-2">
                <NavUser />
            </SidebarFooter>

            <ImportModal open={importModalOpen} onOpenChange={setImportModalOpen} />
        </Sidebar>
    );
}
