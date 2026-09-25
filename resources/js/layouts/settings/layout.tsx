import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Bell, Globe, KeyRound, Palette, Shield, User } from 'lucide-react';

interface NavItem {
    title: string;
    description: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

const navSections: { label: string; items: NavItem[] }[] = [
    {
        label: 'ACCOUNT',
        items: [
            {
                title: 'Profile',
                description: 'Personal info, email & account details',
                url: '/settings/profile',
                icon: User,
            },
            {
                title: 'Password & Security',
                description: 'Manage authentication & security',
                url: '/settings/password',
                icon: KeyRound,
            },
        ],
    },
    {
        label: 'WEBSITES & DEFAULTS',
        items: [
            {
                title: 'Website Settings',
                description: 'Public identity, homepage & SEO defaults',
                url: '/settings/website',
                icon: Globe,
            },
        ],
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="mx-auto max-w-[1400px] space-y-7 p-6 md:p-9 text-foreground">
            {/* Settings Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                    Settings
                </h1>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm font-medium">
                    Manage your account profile, credentials, and website preferences.
                </p>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-10 items-start">
                {/* Navigation Sidebar */}
                <aside className="w-full lg:w-72 shrink-0">
                    <nav className="space-y-6 rounded-[24px] border border-border bg-card p-3.5 shadow-xs">
                        {navSections.map((section) => (
                            <div key={section.label} className="space-y-1">
                                <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                    {section.label}
                                </p>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = currentPath === item.url;
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.url}
                                                href={item.url}
                                                prefetch
                                                className={cn(
                                                    'group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all',
                                                    isActive
                                                        ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium',
                                                )}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={cn(
                                                            'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                                                            isActive
                                                                ? 'bg-primary text-primary-foreground shadow-2xs'
                                                                : 'bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground',
                                                        )}
                                                    >
                                                        <Icon className="size-4" />
                                                    </div>
                                                    <div className="min-w-0 text-left">
                                                        <div className="truncate text-xs font-semibold leading-tight text-foreground">
                                                            {item.title}
                                                        </div>
                                                        <div className="truncate text-[10px] text-muted-foreground font-normal leading-tight mt-0.5 hidden sm:block">
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </div>

                                                {item.badge && (
                                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Form Card Content */}
                <div className="flex-1 w-full max-w-3xl">
                    <div className="rounded-[24px] border border-border bg-card p-6 md:p-8 shadow-xs text-card-foreground">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
