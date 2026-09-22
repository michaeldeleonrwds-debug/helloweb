<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\PageRevision;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $websites = $user->websites()->withCount('pages')->latest()->get();
        $pages = Page::query()->whereHas('website', fn ($query) => $query->where('user_id', $user->id))->with('website')->latest()->limit(8)->get();
        $pageCount = Page::query()->whereHas('website', fn ($query) => $query->where('user_id', $user->id))->count();
        $revisions = PageRevision::query()->whereHas('page.website', fn ($query) => $query->where('user_id', $user->id))->with('page')->latest()->limit(6)->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'websites' => $websites->count(),
                'pages' => $pageCount,
                'templates' => $user->templates()->where('status', 'active')->count(),
                'media' => $user->mediaAssets()->where('status', 'active')->count(),
                'reusableComponents' => $user->reusableComponents()->where('status', 'active')->count(),
            ],
            'websites' => $websites->map(fn ($website): array => [
                'id' => $website->id,
                'name' => $website->name,
                'slug' => $website->slug,
                'status' => $website->status,
                'pagesCount' => $website->pages_count,
                'updatedAt' => $website->updated_at?->toISOString(),
            ])->values()->all(),
            'pages' => $pages->map(fn ($page): array => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'websiteName' => $page->website->name,
                'updatedAt' => $page->updated_at?->toISOString(),
            ])->values()->all(),
            'revisions' => $revisions->map(fn ($revision): array => [
                'id' => $revision->id,
                'pageId' => $revision->page_id,
                'pageTitle' => $revision->page->title,
                'number' => $revision->revision_number,
                'type' => $revision->type,
                'createdAt' => $revision->created_at?->toISOString(),
            ])->values()->all(),
        ]);
    }
}
