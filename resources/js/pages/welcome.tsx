import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Boxes, Layers3, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="HelloWeb" />
            <div className="bg-background text-foreground min-h-screen">
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
                    <Link href={route('home')} className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
                        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">H</span>
                        HelloWeb
                    </Link>
                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Button asChild size="sm">
                                <Link href={route('dashboard')}>
                                    Open dashboard <ArrowRight />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm transition"
                                >
                                    Log in
                                </Link>
                                <Button asChild size="sm">
                                    <Link href={route('register')}>
                                        Get started <ArrowRight />
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </header>
                <main className="mx-auto max-w-6xl px-6 pt-14 pb-20 lg:px-8 lg:pt-24">
                    <section className="max-w-3xl">
                        <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Visual website building</p>
                        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">
                            Build a better web presence, visually.
                        </h1>
                        <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
                            HelloWeb gives teams a structured workspace to create, manage, and eventually publish websites without losing control of
                            the underlying system.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild size="lg">
                                <Link href={auth.user ? route('builder') : route('register')}>
                                    {auth.user ? 'Open your builder' : 'Create your workspace'} <ArrowRight />
                                </Link>
                            </Button>
                            <Link
                                href={route('login')}
                                className="border-border hover:bg-muted inline-flex h-11 items-center rounded-md border px-5 text-sm font-medium transition"
                            >
                                Sign in
                            </Link>
                        </div>
                    </section>
                    <section className="border-border mt-24 grid gap-4 border-t pt-8 md:grid-cols-3">
                        <Feature
                            icon={<Boxes />}
                            title="Manage your sites"
                            description="Keep websites, pages, and revisions organized in one platform workspace."
                        />
                        <Feature
                            icon={<Layers3 />}
                            title="Compose with structure"
                            description="Build from registered components while keeping documents portable and validated."
                        />
                        <Feature
                            icon={<Sparkles />}
                            title="Create with momentum"
                            description="Reuse templates, media, and component definitions as your system grows."
                        />
                    </section>
                </main>
            </div>
        </>
    );
}

function Feature({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="border-border bg-card rounded-lg border p-5 shadow-xs">
            <div className="bg-muted text-primary flex size-9 items-center justify-center rounded-lg">{icon}</div>
            <h2 className="mt-5 text-sm font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
        </div>
    );
}
