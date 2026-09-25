<?php

namespace App\Http\Controllers;

use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PageController extends Controller
{
    public function index(Request $request): Response
    {
        $pages = Page::query()
            ->whereHas('website', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with('website')
            ->latest()
            ->get();

        $websites = $request->user()->websites()->get(['id', 'name', 'slug']);

        return Inertia::render('pages/index', [
            'pages' => $pages->map(fn (Page $page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'websiteName' => $page->website->name,
                'websiteId' => $page->website_id,
                'updatedAt' => $page->updated_at?->toISOString(),
            ])->values()->all(),
            'websites' => $websites->map(fn ($w): array => [
                'id' => $w->id,
                'name' => $w->name,
                'slug' => $w->slug,
            ])->values()->all(),
        ]);
    }

    public function store(Request $request, BuilderPagePersistenceService $service): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'website_id' => ['nullable', 'integer', 'exists:websites,id'],
        ]);

        $website = isset($validated['website_id'])
            ? $user->websites()->findOrFail($validated['website_id'])
            : ($user->websites()->first() ?? $service->createWebsite($user, 'My Website', 'my-website-'.\Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(6))));

        $baseSlug = \Illuminate\Support\Str::slug($validated['slug'] ?: $validated['title']);
        if ($baseSlug === '') {
            $baseSlug = 'page';
        }
        $slug = $baseSlug;
        $counter = 1;
        while ($website->pages()->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $page = $service->createPage($website, $validated['title'], $slug);

        return redirect()->route('builder.pages.show', $page)->with('status', "Page '{$page->title}' created.");
    }

    public function destroy(Request $request, Page $page): RedirectResponse
    {
        abort_unless($page->website->user_id === $request->user()->id, 403);
        if ($page->website->pages()->count() <= 1) {
            return back()->withErrors(['page' => 'Cannot delete the only page of a website.']);
        }
        $title = $page->title;
        $page->delete();

        return back()->with('status', "Page '{$title}' deleted.");
    }

    public function publish(Request $request, Page $page, BuilderPagePersistenceService $service): RedirectResponse
    {
        abort_unless($page->website->user_id === $request->user()->id, 403);
        $service->publishPage($page, null, $request->user());

        return back()->with('status', "Page '{$page->title}' published.");
    }

    public function unpublish(Request $request, Page $page, BuilderPagePersistenceService $service): RedirectResponse
    {
        abort_unless($page->website->user_id === $request->user()->id, 403);
        $service->unpublishPage($page);

        return back()->with('status', "Page '{$page->title}' unpublished.");
    }
}
