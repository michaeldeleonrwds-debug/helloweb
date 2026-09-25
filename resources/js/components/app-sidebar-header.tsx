import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="sticky top-0 z-20 flex h-18 shrink-0 items-center justify-between border-b border-border bg-card/95 px-5 backdrop-blur-md transition-all md:px-7 text-card-foreground">
            {/* Left: Sidebar toggle + Search bar */}
            <div className="flex items-center gap-3 md:gap-5">
                <SidebarTrigger className="-ml-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" />

                {/* Global Search Pill */}
                <div className="relative hidden sm:flex items-center w-64 md:w-80 h-10 rounded-full border border-border bg-muted/40 px-3.5 text-xs text-foreground shadow-2xs transition-all focus-within:border-primary/50 focus-within:bg-card focus-within:ring-3 focus-within:ring-primary/10">
                    <Search className="mr-2.5 size-4 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search websites, pages..."
                        className="min-w-0 flex-1 bg-transparent text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <kbd className="ml-2 inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-[6px] border border-border bg-card px-1.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-2xs select-none whitespace-nowrap">
                        <span>⌘</span>
                        <span>F</span>
                    </kbd>
                </div>

                {breadcrumbs.length > 1 && (
                    <div className="hidden lg:block border-l border-border pl-4">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                )}
            </div>

            {/* Right: Quick actions + Appearance toggle + User profile */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Dark / Light Theme Toggle */}
                <AppearanceToggleDropdown />

                {/* Notifications Bell */}
                <button
                    type="button"
                    title="Notifications"
                    className="relative inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-2xs transition hover:bg-muted hover:text-foreground active:scale-95"
                >
                    <Bell className="size-4" />
                    <span className="absolute top-2 right-2 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
                </button>

                {/* User Profile Pill */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-2.5 rounded-full border border-transparent p-1 text-left transition hover:border-border hover:bg-muted/60 active:scale-98"
                        >
                            <Avatar className="size-9 rounded-full border border-border shadow-2xs">
                                <AvatarImage src={auth?.user?.avatar} alt={auth?.user?.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {getInitials(auth?.user?.name ?? 'HW')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col">
                                <span className="text-xs font-bold leading-tight text-foreground truncate max-w-[130px]">
                                    {auth?.user?.name ?? 'Account'}
                                </span>
                                <span className="text-[11px] leading-tight text-muted-foreground truncate max-w-[130px]">
                                    {auth?.user?.email ?? ''}
                                </span>
                            </div>
                            <ChevronDown className="hidden md:block size-3.5 text-muted-foreground/70 mr-1" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-xl shadow-lg border border-border bg-card text-card-foreground" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
