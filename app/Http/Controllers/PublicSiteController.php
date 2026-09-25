<?php

namespace App\Http\Controllers;

use App\Builder\Document\BuilderDocument;
use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Models\Page;
use App\Models\Website;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PublicSiteController extends Controller
{
    public function home(Request $request, BuilderPagePersistenceService $pages): Response
    {
        $website = Website::current();

        if (! $website) {
            return Inertia::render('welcome');
        }

        $page = $website->homepage;

        // If configured homepage is missing or not published, fall back to any published page
        if (! $page || ! $page->isPublished()) {
            $page = $website->pages()
                ->where('status', 'published')
                ->whereNotNull('published_document')
                ->first();
        }

        if (! $page) {
            return Inertia::render('welcome');
        }

        $document = $pages->loadPublishedDocument($page) ?? $pages->loadDocument($page);

        return $this->renderPage($website, $page, $document);
    }

    public function show(string $slug, Request $request, BuilderPagePersistenceService $pages): Response
    {
        $website = Website::current();

        if (! $website) {
            abort(404);
        }

        // Public routes only resolve published pages
        $page = $website->pages()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (! $page) {
            abort(404);
        }

        $document = $pages->loadPublishedDocument($page) ?? $pages->loadDocument($page);

        return $this->renderPage($website, $page, $document);
    }

    public function preview(Page $page, BuilderPagePersistenceService $pages): Response
    {
        return $this->renderPage($page->website, $page, $pages->loadDocument($page));
    }

    private function renderPage(Website $website, Page $page, BuilderDocument $document): Response
    {
        return Inertia::render('public-site', [
            'website' => [
                'name' => $website->name,
                'title' => $website->site_title ?: $website->name,
                'tagline' => $website->tagline,
                'faviconUrl' => $website->favicon_url,
            ],
            'page' => ['title' => $page->title, 'slug' => $page->slug],
            'document' => $document->toArray(),
        ]);
    }
}

