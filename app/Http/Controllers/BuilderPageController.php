<?php

namespace App\Http\Controllers;

use App\Builder\Media\MediaAssetService;
use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Builder\Persistence\ReusableComponentService;
use App\Builder\Persistence\StaleDocumentException;
use App\Builder\Persistence\TemplatePersistenceService;
use App\Http\Requests\Builder\SaveBuilderDocumentRequest;
use App\Models\Page;
use App\Models\PageRevision;
use App\Models\Template;
use App\Services\AiConnectionStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

final class BuilderPageController extends Controller
{
    public function __construct(
        private readonly BuilderPagePersistenceService $service,
        private readonly MediaAssetService $media,
        private readonly ReusableComponentService $reusableComponents,
        private readonly TemplatePersistenceService $templates,
        private readonly AiConnectionStatusService $aiStatus,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $website = $user->websites()->first() ?? $this->service->createWebsite($user, 'My Website', 'my-website-'.Str::lower(Str::random(6)));
        $page = $website->pages()->first() ?? $this->service->createPage($website, 'Home', 'home');

        return redirect()->route('builder.pages.show', $page);
    }

    public function show(Page $page): Response
    {
        Gate::authorize('view', $page);
        $user = $page->website->user;
        $this->templates->ensureDefaultTemplates($user);
        $document = $this->service->loadDocument($page);

        $website = $page->website;
        $website->load(['headerTemplate', 'footerTemplate']);

        $allTemplates = $this->templates->available($user);
        $headerTemplates = [];
        $footerTemplates = [];
        $pageTemplates = [];

        foreach ($allTemplates as $t) {
            $entry = [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'description' => $t->description,
                'type' => $t->type,
                'is_platform' => (bool) $t->is_platform,
                'document' => $t->document,
            ];
            if ($t->type === 'header') {
                $headerTemplates[] = $entry;
            } elseif ($t->type === 'footer') {
                $footerTemplates[] = $entry;
            } elseif ($t->type === 'page') {
                $pageTemplates[] = $entry;
            }
        }

        return Inertia::render('builder', [
            'page' => $this->pageData($page),
            'document' => $document->toArray(),
            'save' => ['status' => 'saved', 'version' => (int) $page->document_version],
            'headerTemplateId' => $website->header_template_id,
            'footerTemplateId' => $website->footer_template_id,
            'headerDocument' => $website->headerTemplate?->document,
            'footerDocument' => $website->footerTemplate?->document,
            'headerTemplates' => $headerTemplates,
            'footerTemplates' => $footerTemplates,
            'pageTemplates' => $pageTemplates,
            'reusableComponents' => $this->reusableComponents->definitions($user),
            'templates' => array_map(fn ($template): array => [
                'id' => $template->id,
                'name' => $template->name,
                'slug' => $template->slug,
                'type' => $template->type,
                'description' => $template->description,
            ], $allTemplates),
            'mediaAssets' => $user->mediaAssets()->where('status', 'active')->latest()->get(['id', 'user_id', 'folder_id', 'storage_key', 'original_filename', 'mime_type', 'file_size', 'width', 'height', 'alt_text', 'status'])->map(function ($asset) use ($user): array {
                return [
                    'id' => $asset->id,
                    'folderId' => $asset->folder_id,
                    'originalFilename' => $asset->original_filename,
                    'mimeType' => $asset->mime_type,
                    'fileSize' => $asset->file_size,
                    'width' => $asset->width,
                    'height' => $asset->height,
                    'altText' => $asset->alt_text,
                    'status' => $asset->status,
                    'url' => $this->media->reference($user, $asset)->url,
                ];
            })->values()->all(),
            'availablePages' => $website->pages()->orderBy('title')->get(['id', 'title', 'slug', 'status'])->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'status' => $p->status,
                'url' => '/' . ltrim($p->slug, '/'),
            ])->values()->all(),
            'aiStatus' => $this->aiStatus->forUser($user),
        ]);
    }

    public function updateThemeLayout(Request $request, Page $page): JsonResponse
    {
        Gate::authorize('update', $page);
        $website = $page->website;
        abort_unless((int) $website->user_id === (int) $request->user()->id || $request->user()->isSuperAdmin(), 403);

        $validated = $request->validate([
            'header_template_id' => ['nullable', 'exists:templates,id'],
            'footer_template_id' => ['nullable', 'exists:templates,id'],
        ]);

        if (array_key_exists('header_template_id', $validated)) {
            $website->header_template_id = $validated['header_template_id'];
        }
        if (array_key_exists('footer_template_id', $validated)) {
            $website->footer_template_id = $validated['footer_template_id'];
        }
        $website->save();

        $website->load(['headerTemplate', 'footerTemplate']);

        return response()->json([
            'success' => true,
            'headerTemplateId' => $website->header_template_id,
            'footerTemplateId' => $website->footer_template_id,
            'headerDocument' => $website->headerTemplate?->document,
            'footerDocument' => $website->footerTemplate?->document,
        ]);
    }

    public function showTemplate(Template $template): Response
    {
        Gate::authorize('update', $template);
        $user = $template->user;
        $website = $user->websites()->first();

        return Inertia::render('builder', [
            'isTemplate' => true,
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'slug' => $template->slug,
                'type' => $template->type,
                'description' => $template->description,
            ],
            'page' => [
                'id' => $template->id,
                'title' => $template->name,
                'websiteName' => $website?->name ?? 'Theme Template',
                'version' => (int) $template->schema_version,
                'status' => $template->status,
                'slug' => $template->slug,
            ],
            'document' => $template->document,
            'save' => ['status' => 'saved', 'version' => (int) $template->schema_version],
            'reusableComponents' => $this->reusableComponents->definitions($user),
            'templates' => array_map(fn ($t): array => [
                'id' => $t->id,
                'name' => $t->name,
                'description' => $t->description,
            ], $this->templates->available($user)),
            'mediaAssets' => $user->mediaAssets()->where('status', 'active')->latest()->get(['id', 'user_id', 'folder_id', 'storage_key', 'original_filename', 'mime_type', 'file_size', 'width', 'height', 'alt_text', 'status'])->map(function ($asset) use ($user): array {
                return [
                    'id' => $asset->id,
                    'folderId' => $asset->folder_id,
                    'originalFilename' => $asset->original_filename,
                    'mimeType' => $asset->mime_type,
                    'fileSize' => $asset->file_size,
                    'width' => $asset->width,
                    'height' => $asset->height,
                    'altText' => $asset->alt_text,
                    'status' => $asset->status,
                    'url' => $this->media->reference($user, $asset)->url,
                ];
            })->values()->all(),
            'availablePages' => $website ? $website->pages()->orderBy('title')->get(['id', 'title', 'slug', 'status'])->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'status' => $p->status,
                'url' => '/' . ltrim($p->slug, '/'),
            ])->values()->all() : [],
            'aiStatus' => $this->aiStatus->forUser($user),
        ]);
    }

    public function updateTemplateDocument(Request $request, Template $template): JsonResponse
    {
        Gate::authorize('update', $template);
        $data = $request->validate([
            'document' => ['required', 'array'],
        ]);

        try {
            $updated = $this->templates->update($request->user(), $template, $data['document']);
        } catch (\InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'save' => ['status' => 'error']], 422);
        }

        return response()->json([
            'template' => [
                'id' => $updated->id,
                'name' => $updated->name,
                'slug' => $updated->slug,
                'type' => $updated->type,
            ],
            'page' => [
                'id' => $updated->id,
                'title' => $updated->name,
                'slug' => $updated->slug,
                'version' => (int) $updated->schema_version,
            ],
            'save' => ['status' => 'saved', 'version' => (int) $updated->schema_version],
        ]);
    }

    public function updateDocument(SaveBuilderDocumentRequest $request, Page $page): JsonResponse

    {
        try {
            $saved = $this->service->saveDraft($page, $request->validated('document'), (int) $request->validated('expected_version'));
        } catch (StaleDocumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'save' => ['status' => 'stale', 'version' => $exception->currentVersion],
            ], 409);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'save' => ['status' => 'error']], 422);
        }

        return response()->json([
            'page' => $this->pageData($saved),
            'save' => ['status' => 'saved', 'version' => (int) $saved->document_version],
        ]);
    }

    public function publish(Request $request, Page $page): JsonResponse
    {
        Gate::authorize('update', $page);
        $documentData = $request->input('document');
        $published = $this->service->publishPage($page, is_array($documentData) ? $documentData : null, $request->user());

        return response()->json([
            'message' => 'Page published successfully.',
            'page' => $this->pageData($published),
            'save' => ['status' => 'saved', 'version' => (int) $published->document_version],
        ]);
    }

    public function unpublish(Request $request, Page $page): JsonResponse
    {
        Gate::authorize('update', $page);
        $unpublished = $this->service->unpublishPage($page);

        return response()->json([
            'message' => 'Page unpublished.',
            'page' => $this->pageData($unpublished),
        ]);
    }

    public function createRevision(Request $request, Page $page): JsonResponse
    {
        Gate::authorize('update', $page);
        $revision = $this->service->createRevision($page, $request->user());

        return response()->json(['revision' => $this->revisionData($revision)]);
    }

    public function revisions(Page $page): JsonResponse
    {
        Gate::authorize('revisions', $page);

        return response()->json(['revisions' => array_map(fn (PageRevision $revision): array => $this->revisionData($revision), $this->service->revisions($page))]);
    }

    public function restoreRevision(Request $request, Page $page, PageRevision $revision): JsonResponse
    {
        Gate::authorize('update', $page);
        abort_unless($revision->page_id === $page->id, 404);
        $restored = $this->service->restoreRevision($page, $revision, $request->user());

        return response()->json([
            'revision' => $this->revisionData($restored),
            'page' => $this->pageData($page->fresh()),
        ]);
    }

    /** @return array<string, mixed> */
    private function pageData(Page $page): array
    {
        return [
            'id' => $page->id,
            'websiteId' => $page->website_id,
            'websiteName' => $page->website?->name ?? 'Website',
            'title' => $page->title,
            'slug' => $page->slug,
            'status' => $page->status,
            'version' => (int) $page->document_version,
        ];
    }

    /** @return array<string, mixed> */
    private function revisionData(PageRevision $revision): array
    {
        return [
            'id' => $revision->id,
            'pageId' => $revision->page_id,
            'number' => $revision->revision_number,
            'schemaVersion' => $revision->schema_version,
            'type' => $revision->type,
            'createdAt' => $revision->created_at?->toISOString(),
        ];
    }
}
