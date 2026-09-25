import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], label = 'MENU' }: { items: NavItem[]; label?: string }) {
    const page = usePage();
    const pathname = new URL(page.url, window.location.origin).pathname;

    return (
        <SidebarGroup className="px-3 py-1">
            {label ? (
                <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    {label}
                </SidebarGroupLabel>
            ) : null}
            <SidebarMenu className="mt-1 gap-1">
                {items.map((item) => {
                    const itemPath = new URL(item.url, window.location.origin).pathname;
                    const isActive = item.url === page.url || (item.url !== route('dashboard') && pathname.startsWith(itemPath));

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                className={`h-9.5 rounded-xl px-3 transition-all duration-150 ${
                                    isActive
                                        ? 'bg-primary/10 text-primary font-bold shadow-2xs hover:bg-primary/15'
                                        : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-foreground font-medium'
                                }`}
                            >
                                <Link href={item.url} prefetch className="flex items-center gap-3">
                                    {item.icon && (
                                        <item.icon
                                            className={`size-4.5 shrink-0 transition-colors ${
                                                isActive ? 'text-primary stroke-[2.2]' : 'text-neutral-500 group-hover:text-foreground stroke-[1.8]'
                                            }`}
                                        />
                                    )}
                                    <span className="text-xs tracking-tight flex-1">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
