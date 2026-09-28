import AppLogo from '@/components/app-logo';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#F4F6F9] dark:bg-background p-6 md:p-10 font-sans antialiased text-neutral-800 dark:text-foreground transition-colors">
            {/* Top Right Theme Switcher */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <AppearanceToggleDropdown />
            </div>

            <div className="flex w-full max-w-[420px] flex-col gap-6">
                <div className="flex justify-center mb-2">
                    <Link href={route('home')} className="inline-flex items-center gap-2 transition hover:opacity-90">
                        <AppLogo />
                    </Link>
                </div>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-[22px] border border-neutral-200/80 dark:border-border bg-white dark:bg-card shadow-sm transition-colors text-card-foreground">
                        <CardHeader className="px-8 pt-8 pb-2 text-center">
                            <CardTitle className="text-xl font-bold tracking-tight text-neutral-900 dark:text-foreground">{title}</CardTitle>
                            {description && (
                                <CardDescription className="text-sm text-neutral-500 dark:text-muted-foreground font-medium">{description}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-4">{children}</CardContent>
                    </Card>
                </div>

                <p className="text-center text-xs text-neutral-400 dark:text-muted-foreground font-medium">
                    &copy; {new Date().getFullYear()} HelloWeb Studio. All rights reserved.
                </p>
            </div>
        </div>
    );
}
