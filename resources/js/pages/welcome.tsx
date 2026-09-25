import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Boxes, Layers3, Sparkles, LayoutTemplate, Palette, Globe } from 'lucide-react';
import type { ReactNode } from 'react';

import AppLogo from '@/components/app-logo';
import { type SharedData } from '@/types';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="HelloWeb - Modern Visual Website Builder" />
            <div className="min-h-screen bg-[#F4F6F9] text-neutral-800 font-sans antialiased selection:bg-[#134E35]/15 selection:text-[#134E35]">
                {/* Header */}
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
                    <Link href={route('home')} className="transition hover:opacity-90">
                        <AppLogo />
                    </Link>
                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-2 rounded-full bg-[#134E35] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0f3d2a]"
                            >
                                Open Dashboard <ArrowRight className="size-3.5" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-full px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-200/50 hover:text-neutral-900"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#134E35] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0f3d2a]"
                                >
                                    Get Started <ArrowRight className="size-3.5" />
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <main className="mx-auto max-w-6xl px-6 pt-12 pb-24 lg:px-8 lg:pt-20">
                    <section className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white border border-neutral-200/80 px-4 py-1.5 text-xs font-semibold text-neutral-600 shadow-2xs mb-6">
                            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                            Next-Generation Visual Website Framework
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 text-balance sm:text-6xl sm:leading-[1.15]">
                            Build a better web presence, <span className="text-[#134E35]">visually.</span>
                        </h1>
                        <p className="mt-6 text-lg leading-relaxed text-neutral-600 font-normal max-w-2xl mx-auto">
                            HelloWeb gives creators and teams an extensible, visual workspace to design, manage, and publish high-performance websites with complete architectural control.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                            <Link
                                href={auth.user ? route('builder') : route('register')}
                                className="inline-flex items-center gap-2 rounded-full bg-[#134E35] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f3d2a] hover:shadow-md"
                            >
                                {auth.user ? 'Open Visual Studio' : 'Create Free Workspace'} <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href={auth.user ? route('dashboard') : route('login')}
                                className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 shadow-2xs transition hover:bg-neutral-50 hover:text-neutral-900"
                            >
                                {auth.user ? 'Go to Dashboard' : 'Sign in to Account'}
                            </Link>
                        </div>
                    </section>

                    {/* Preview Mockup Card */}
                    <div className="mt-14 overflow-hidden rounded-[26px] border border-neutral-200/90 bg-white p-3 sm:p-5 shadow-lg shadow-neutral-200/50">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 px-3">
                            <div className="flex items-center gap-2">
                                <span className="size-3 rounded-full bg-rose-400" />
                                <span className="size-3 rounded-full bg-amber-400" />
                                <span className="size-3 rounded-full bg-emerald-400" />
                                <span className="ml-2 text-xs font-semibold text-neutral-400">helloweb.studio / workspace</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-0.5 border border-emerald-200/50">Engine Active</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <div className="rounded-[18px] bg-[#134E35] p-6 text-white flex flex-col justify-between min-h-[160px]">
                                <div>
                                    <div className="flex items-center justify-between text-emerald-200/80 text-xs font-semibold uppercase tracking-wider">
                                        <span>Studio Framework</span>
                                        <Sparkles className="size-4 text-emerald-300" />
                                    </div>
                                    <h3 className="mt-3 text-xl font-bold">Extensible Primitives</h3>
                                    <p className="mt-1.5 text-xs text-emerald-100/70 leading-relaxed">Structured document trees, reactive canvas state, and instant previews.</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-200">
                                    <span>Learn more</span>
                                    <ArrowRight className="size-3.5" />
                                </div>
                            </div>
                            <div className="rounded-[18px] bg-neutral-50 border border-neutral-200/70 p-6 flex flex-col justify-between min-h-[160px]">
                                <div>
                                    <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                        <span>Component Library</span>
                                        <Boxes className="size-4 text-neutral-600" />
                                    </div>
                                    <h3 className="mt-3 text-xl font-bold text-neutral-900">Custom Components</h3>
                                    <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">Containers, hero sections, responsive grids, buttons, and custom code blocks.</p>
                                </div>
                                <div className="mt-4 text-xs font-bold text-neutral-700">Pre-registered & ready</div>
                            </div>
                            <div className="rounded-[18px] bg-neutral-50 border border-neutral-200/70 p-6 flex flex-col justify-between min-h-[160px]">
                                <div>
                                    <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                        <span>Publishing Engine</span>
                                        <Globe className="size-4 text-neutral-600" />
                                    </div>
                                    <h3 className="mt-3 text-xl font-bold text-neutral-900">Production Ready</h3>
                                    <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">Clean static output, zero editor payload on public sites, responsive by design.</p>
                                </div>
                                <div className="mt-4 text-xs font-bold text-neutral-700">High performance</div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <section className="mt-16 grid gap-6 md:grid-cols-3">
                        <Feature
                            icon={<Boxes className="size-5" />}
                            title="Manage your sites"
                            description="Keep websites, pages, and revision histories organized in one centralized, intuitive studio dashboard."
                        />
                        <Feature
                            icon={<Layers3 className="size-5" />}
                            title="Compose with structure"
                            description="Build from registered component schemas while keeping documents fully validated, versioned, and portable."
                        />
                        <Feature
                            icon={<Sparkles className="size-5" />}
                            title="Create with momentum"
                            description="Reuse pre-built templates, centralized media, and global block presets as your digital ecosystem grows."
                        />
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-neutral-200/70 bg-white py-8">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-neutral-900">HelloWeb</span>
                            <span className="text-xs text-neutral-400">&mdash; Visual Website Builder Framework</span>
                        </div>
                        <p className="text-xs text-neutral-400">
                            &copy; {new Date().getFullYear()} HelloWeb. Built for performance and modern web standards.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function Feature({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="rounded-[22px] border border-neutral-200/80 bg-white p-7 shadow-xs transition hover:shadow-md hover:border-neutral-300">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#134E35]/10 text-[#134E35] mb-5">
                {icon}
            </div>
            <h3 className="text-base font-bold text-neutral-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500 font-medium">{description}</p>
        </div>
    );
}
