<?php

namespace App\Http\Controllers;

use App\Builder\Document\BuilderDocument;
use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Models\Page;
use App\Models\Template;
use App\Models\Website;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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
        $website = $page->website->fresh(['headerTemplate', 'footerTemplate']);
        return $this->renderPage($website, $page, $pages->loadDocument($page), isPreview: true);
    }

    /**
     * Preview a header / footer / page template in the context of the owning
     * website's real homepage, with this template overlaid.
     */
    public function previewTemplate(Request $request, Template $template, BuilderPagePersistenceService $pages): Response
    {
        Gate::authorize('view', $template);

        $website = $template->user->websites()->first() ?? Website::current();
        abort_unless($website instanceof Website, 404);

        $page = $website->homepage ?? $website->pages()->first();
        abort_unless($page instanceof Page, 404);

        $website->load(['headerTemplate', 'footerTemplate']);

        $headerOverride = null;
        $footerOverride = null;
        $document = $pages->loadDocument($page);

        if ($template->type === 'header') {
            $headerOverride = $template->document;
        } elseif ($template->type === 'footer') {
            $footerOverride = $template->document;
        } elseif ($template->type === 'page') {
            $document = BuilderDocument::fromArray($template->document);
        }

        return $this->renderPage(
            $website,
            $page,
            $document,
            isPreview: true,
            headerOverride: $headerOverride,
            footerOverride: $footerOverride,
        );
    }

    private function renderPage(
        Website $website,
        Page $page,
        BuilderDocument $document,
        bool $isPreview = false,
        ?array $headerOverride = null,
        ?array $footerOverride = null,
    ): Response {
        $headerDocument = $headerOverride;
        if ($headerDocument === null && $website->header_template_id && $website->headerTemplate) {
            $headerDocument = $website->headerTemplate->document;
        }

        $footerDocument = $footerOverride;
        if ($footerDocument === null && $website->footer_template_id && $website->footerTemplate) {
            $footerDocument = $website->footerTemplate->document;
        }

        return Inertia::render('public-site', [
            'website' => [
                'name' => $website->name,
                'title' => $website->site_title ?: $website->name,
                'tagline' => $website->tagline,
                'faviconUrl' => $website->favicon_url,
            ],
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'isPublished' => $page->isPublished(),
            ],
            'document' => $document->toArray(),
            'headerDocument' => $headerDocument,
            'footerDocument' => $footerDocument,
            'isPreview' => $isPreview,
        ]);
    }
}


