import { Head, useForm } from '@inertiajs/react';

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
                    <HeadingSmall title="Website settings" description="Choose the page visitors see first and control your browser tab details." />
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch(route('website.settings.update'));
                        }}
                        className="space-y-6"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="name">Website name</Label>
                            <Input id="name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} required />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="site_title">Browser tab title</Label>
                            <Input
                                id="site_title"
                                value={form.data.site_title}
                                onChange={(event) => form.setData('site_title', event.target.value)}
                            />
                            <p className="text-muted-foreground text-xs">Used in the page title and browser tab.</p>
                            <InputError message={form.errors.site_title} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tagline">Site description</Label>
                            <Input id="tagline" value={form.data.tagline} onChange={(event) => form.setData('tagline', event.target.value)} />
                            <p className="text-muted-foreground text-xs">Used as the public page meta description.</p>
                            <InputError message={form.errors.tagline} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="favicon_url">Favicon URL</Label>
                            <Input
                                id="favicon_url"
                                type="url"
                                placeholder="https://example.com/favicon.png"
                                value={form.data.favicon_url}
                                onChange={(event) => form.setData('favicon_url', event.target.value)}
                            />
                            <InputError message={form.errors.favicon_url} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="homepage_page_id">Homepage</Label>
                            <select
                                id="homepage_page_id"
                                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                value={String(form.data.homepage_page_id)}
                                onChange={(event) => form.setData('homepage_page_id', Number(event.target.value))}
                            >
                                {pages.map((page) => (
                                    <option key={page.id} value={page.id}>
                                        {page.title} (/{page.slug})
                                    </option>
                                ))}
                            </select>
                            <p className="text-muted-foreground text-xs">This page is rendered at the public site root.</p>
                            <InputError message={form.errors.homepage_page_id} />
                        </div>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Saving...' : 'Save website settings'}
                        </Button>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
