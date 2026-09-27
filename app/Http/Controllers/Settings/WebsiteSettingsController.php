<?php

namespace App\Http\Controllers\Settings;

use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class WebsiteSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $website = $request->user()->websites()->with('pages')->first();

        if (! $website) {
            $website = app(BuilderPagePersistenceService::class)->createWebsite($request->user(), 'My Website', 'my-website');
        }

        $templates = \App\Models\Template::where('status', 'active')
            ->where(fn ($q) => $q->where('user_id', $request->user()->id)->orWhere('is_platform', true))
            ->get(['id', 'name', 'type']);

        return Inertia::render('settings/website', [
            'website' => [
                'id' => $website->id,
                'name' => $website->name,
                'siteTitle' => $website->site_title ?: $website->name,
                'tagline' => $website->tagline,
                'faviconUrl' => $website->favicon_url,
                'homepageId' => $website->homepage_page_id,
                'headerTemplateId' => $website->header_template_id,
                'footerTemplateId' => $website->footer_template_id,
            ],
            'pages' => $website->pages()->orderBy('title')->get(['id', 'title', 'slug'])->map(fn ($page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
            ])->values()->all(),
            'headerTemplates' => $templates->where('type', 'header')->map(fn ($t): array => [
                'id' => $t->id,
                'name' => $t->name,
            ])->values()->all(),
            'footerTemplates' => $templates->where('type', 'footer')->map(fn ($t): array => [
                'id' => $t->id,
                'name' => $t->name,
            ])->values()->all(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $website = $request->user()->websites()->firstOrFail();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'site_title' => ['nullable', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:180'],
            'favicon_url' => ['nullable', 'url', 'max:2048'],
            'homepage_page_id' => ['required', 'integer', 'exists:pages,id'],
            'header_template_id' => ['nullable', 'integer', 'exists:templates,id'],
            'footer_template_id' => ['nullable', 'integer', 'exists:templates,id'],
        ]);

        abort_unless($website->pages()->whereKey($data['homepage_page_id'])->exists(), 422);

        if (! empty($data['header_template_id'])) {
            abort_unless(
                \App\Models\Template::whereKey($data['header_template_id'])
                    ->where(fn ($q) => $q->where('user_id', $request->user()->id)->orWhere('is_platform', true))
                    ->exists(),
                422
            );
        }
        if (! empty($data['footer_template_id'])) {
            abort_unless(
                \App\Models\Template::whereKey($data['footer_template_id'])
                    ->where(fn ($q) => $q->where('user_id', $request->user()->id)->orWhere('is_platform', true))
                    ->exists(),
                422
            );
        }

        $website->update($data);

        return back()->with('status', 'Website settings saved.');
    }

}
