<?php

namespace App\Http\Controllers;

use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Models\Page;
use App\Models\Website;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PublicSiteController extends Controller
{
    public function home(BuilderPagePersistenceService $pages): Response
    {
        $website = Website::query()->with('homepage')->latest()->first();

        if (! $website || ! $website->homepage) {
            return Inertia::render('welcome');
        }

        return $this->renderPage($website, $website->homepage, $pages);
    }

    public function preview(Page $page, BuilderPagePersistenceService $pages): Response
    {
        return $this->renderPage($page->website, $page, $pages);
    }

    private function renderPage(Website $website, Page $page, BuilderPagePersistenceService $pages): Response
    {
        return Inertia::render('public-site', [
            'website' => [
                'name' => $website->name,
                'title' => $website->site_title ?: $website->name,
                'tagline' => $website->tagline,
                'faviconUrl' => $website->favicon_url,
            ],
            'page' => ['title' => $page->title, 'slug' => $page->slug],
            'document' => $pages->loadDocument($page)->toArray(),
        ]);
    }
}
