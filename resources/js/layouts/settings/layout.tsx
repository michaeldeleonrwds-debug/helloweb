import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Bot, Globe, KeyRound, User } from 'lucide-react';

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
            {
                title: 'AI',
                description: 'OpenAI and external AI connection settings',
                url: '/settings/ai',
                icon: Bot,
            },
        ],
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="text-foreground mx-auto max-w-[1400px] space-y-7 p-6 md:p-9">
            {/* Settings Header */}
            <div>
                <h1 className="text-foreground text-3xl font-extrabold tracking-tight md:text-4xl">Settings</h1>
                <p className="text-muted-foreground mt-1 text-xs font-medium md:text-sm">
                    Manage your account profile, credentials, and website preferences.
                </p>
            </div>

            <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-10">
                {/* Navigation Sidebar */}
                <aside className="w-full shrink-0 lg:w-72">
                    <nav className="border-border bg-card space-y-6 rounded-[24px] border p-3.5 shadow-xs">
                        {navSections.map((section) => (
                            <div key={section.label} className="space-y-1">
                                <p className="text-muted-foreground px-3 text-[10px] font-bold tracking-wider uppercase">{section.label}</p>
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
                                                <div className="flex min-w-0 items-center gap-3">
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
                                                        <div className="text-foreground truncate text-xs leading-tight font-semibold">
                                                            {item.title}
                                                        </div>
                                                        <div className="text-muted-foreground mt-0.5 hidden truncate text-[10px] leading-tight font-normal sm:block">
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </div>

                                                {item.badge && (
                                                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[9px] font-bold">
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
                <div className="w-full max-w-3xl flex-1">
                    <div className="border-border bg-card text-card-foreground rounded-[24px] border p-6 shadow-xs md:p-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
