import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="sticky top-0 z-20 flex h-18 shrink-0 items-center justify-between border-b border-neutral-200/70 bg-white/95 px-5 backdrop-blur-md transition-all md:px-7">
            {/* Left: Sidebar toggle + Search bar */}
            <div className="flex items-center gap-3 md:gap-5">
                <SidebarTrigger className="-ml-1.5 text-muted-foreground hover:bg-neutral-100 hover:text-foreground" />

                {/* Global Search Pill (Reference Inspired) */}
                <div className="relative hidden sm:flex items-center w-64 md:w-80 h-10 rounded-full border border-neutral-200/80 bg-neutral-50/70 px-3.5 text-xs text-neutral-700 shadow-2xs transition-all focus-within:border-primary/50 focus-within:bg-white focus-within:ring-3 focus-within:ring-primary/10">
                    <Search className="mr-2.5 size-4 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search websites, pages..."
                        className="w-full bg-transparent text-xs font-medium text-foreground placeholder:text-neutral-400 outline-none"
                    />
                    <kbd className="ml-auto inline-flex items-center gap-0.5 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-400 shadow-2xs">
                        ⌘ F
                    </kbd>
                </div>

                {breadcrumbs.length > 1 && (
                    <div className="hidden lg:block border-l border-neutral-200/70 pl-4">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                )}
            </div>

            {/* Right: Quick actions + User profile */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
                {/* Visual Builder Quick Icon */}
                <Link
                    href="/builder"
                    title="Launch Visual Builder"
                    className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-200/80 bg-white text-neutral-600 shadow-2xs transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95"
                >
                    <Sparkles className="size-4" />
                </Link>

                {/* Notifications Bell */}
                <button
                    type="button"
                    title="Notifications"
                    className="relative inline-flex size-9 items-center justify-center rounded-full border border-neutral-200/80 bg-white text-neutral-600 shadow-2xs transition hover:bg-neutral-50 hover:text-foreground active:scale-95"
                >
                    <Bell className="size-4" />
                    <span className="absolute top-2 right-2 size-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </button>

                {/* User Profile Pill (Reference Inspired) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-2.5 rounded-full border border-transparent p-1 text-left transition hover:border-neutral-200/80 hover:bg-neutral-50 active:scale-98"
                        >
                            <Avatar className="size-9 rounded-full border border-neutral-200 shadow-2xs">
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
                    <DropdownMenuContent className="w-56 rounded-xl shadow-lg border border-neutral-200" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
