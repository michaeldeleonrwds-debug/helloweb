import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#F4F6F9] dark:bg-background p-6 md:p-10 font-sans antialiased text-neutral-800 dark:text-foreground transition-colors">
            {/* Top Right Theme Switcher */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <AppearanceToggleDropdown />
            </div>

            <div className="w-full max-w-[420px]">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-center mb-2">
                        <Link href={route('home')} className="inline-flex items-center gap-2 transition hover:opacity-90">
                            <AppLogo />
                        </Link>
                    </div>

                    <div className="rounded-[22px] border border-neutral-200/80 dark:border-border bg-white dark:bg-card p-7 sm:p-9 shadow-sm text-card-foreground transition-colors">
                        <div className="mb-6 space-y-1.5 text-center">
                            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-foreground">{title}</h1>
                            {description && (
                                <p className="text-sm text-neutral-500 dark:text-muted-foreground font-medium">{description}</p>
                            )}
                        </div>
                        {children}
                    </div>

                    <p className="text-center text-xs text-neutral-400 dark:text-muted-foreground font-medium">
                        &copy; {new Date().getFullYear()} HelloWeb Studio. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
