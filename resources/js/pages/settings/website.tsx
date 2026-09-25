import { Head, useForm } from '@inertiajs/react';
import { Check, Globe, HelpCircle, Home, Image as ImageIcon, Layout, Sparkles, Type } from 'lucide-react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

interface WebsiteSettings {
    name: string;
    siteTitle: string;
    tagline: string | null;
    faviconUrl: string | null;
    homepageId: number | null;
}

interface WebsitePage {
    id: number;
    title: string;
    slug: string;
}

export default function WebsiteSettingsPage({ website, pages }: { website: WebsiteSettings; pages: WebsitePage[] }) {
    const form = useForm({
        name: website.name,
        site_title: website.siteTitle,
        tagline: website.tagline ?? '',
        favicon_url: website.faviconUrl ?? '',
        homepage_page_id: website.homepageId ?? pages[0]?.id ?? '',
    });
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Website settings', href: route('website.settings.edit') }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                        <HeadingSmall
                            title="Website Settings"
                            description="Configure your website public title, SEO meta description, and primary landing page."
                        />
                        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-primary text-xs font-semibold">
                            <Globe className="size-4 stroke-[2.2]" />
                            <span>Live Configuration</span>
                        </div>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch(route('website.settings.update'));
                        }}
                        className="space-y-5"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Layout className="size-3.5 text-muted-foreground" />
                                Website Name
                            </Label>
                            <Input
                                id="name"
                                className="h-10 rounded-xl"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                required
                                placeholder="My Awesome Website"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="site_title" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Type className="size-3.5 text-muted-foreground" />
                                Browser Tab Title
                            </Label>
                            <Input
                                id="site_title"
                                className="h-10 rounded-xl"
                                value={form.data.site_title}
                                onChange={(event) => form.setData('site_title', event.target.value)}
                                placeholder="e.g. Acme Corp — Modern Web Agency"
                            />
                            <p className="text-muted-foreground text-[11px]">Displayed in the browser tab and search engine results.</p>
                            <InputError message={form.errors.site_title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tagline" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Sparkles className="size-3.5 text-muted-foreground" />
                                Meta Description / Tagline
                            </Label>
                            <Input
                                id="tagline"
                                className="h-10 rounded-xl"
                                value={form.data.tagline}
                                onChange={(event) => form.setData('tagline', event.target.value)}
                                placeholder="A concise description of your company or site"
                            />
                            <p className="text-muted-foreground text-[11px]">Used by social media sharing cards and SEO crawlers.</p>
                            <InputError message={form.errors.tagline} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="favicon_url" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <ImageIcon className="size-3.5 text-muted-foreground" />
                                Favicon URL
                            </Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="favicon_url"
                                    type="url"
                                    placeholder="https://example.com/favicon.png"
                                    className="h-10 rounded-xl flex-1"
                                    value={form.data.favicon_url}
                                    onChange={(event) => form.setData('favicon_url', event.target.value)}
                                />
                                {form.data.favicon_url && (
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 p-1">
                                        <img src={form.data.favicon_url} alt="Favicon preview" className="size-6 object-contain" />
                                    </div>
                                )}
                            </div>
                            <InputError message={form.errors.favicon_url} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="homepage_page_id" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Home className="size-3.5 text-muted-foreground" />
                                Default Homepage
                            </Label>
                            <select
                                id="homepage_page_id"
                                className="h-10 rounded-xl border border-input bg-background px-3.5 text-xs text-foreground font-medium transition focus:border-primary/50 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                                value={String(form.data.homepage_page_id)}
                                onChange={(event) => form.setData('homepage_page_id', Number(event.target.value))}
                            >
                                {pages.map((page) => (
                                    <option key={page.id} value={page.id} className="bg-popover text-popover-foreground">
                                        {page.title} (/{page.slug})
                                    </option>
                                ))}
                            </select>
                            <p className="text-muted-foreground text-[11px]">This page is served when visitors navigate directly to your root URL.</p>
                            <InputError message={form.errors.homepage_page_id} />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-6 shadow-xs transition active:scale-98"
                            >
                                {form.processing ? 'Saving...' : 'Save Website Settings'}
                            </Button>

                            {form.recentlySuccessful && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <Check className="size-3.5" />
                                    Settings saved
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
