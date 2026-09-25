import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Globe, KeyRound, Palette, User } from 'lucide-react';

const sidebarNavItems = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: User,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: KeyRound,
    },
    {
        title: 'Appearance',
        url: '/settings/appearance',
        icon: Palette,
    },
    {
        title: 'Website Settings',
        url: '/settings/website',
        icon: Globe,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="mx-auto max-w-[1400px] space-y-7 p-6 md:p-9">
            {/* Settings Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                    Settings
                </h1>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm font-medium">
                    Manage your account profile, credentials, appearance, and website defaults.
                </p>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
                {/* Navigation Sidebar */}
                <aside className="w-full lg:w-56 shrink-0">
                    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto p-1.5 rounded-[20px] border border-neutral-200/70 bg-white shadow-xs">
                        {sidebarNavItems.map((item) => {
                            const isActive = currentPath === item.url;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.url}
                                    href={item.url}
                                    prefetch
                                    className={cn(
                                        'flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap',
                                        isActive
                                            ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                                            : 'text-neutral-600 hover:bg-neutral-100/70 hover:text-foreground',
                                    )}
                                >
                                    <Icon className={cn('size-4 shrink-0', isActive ? 'text-primary' : 'text-neutral-500')} />
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Form Card Content */}
                <div className="flex-1 max-w-2xl">
                    <div className="rounded-[22px] border border-neutral-200/70 bg-white p-7 shadow-xs">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
