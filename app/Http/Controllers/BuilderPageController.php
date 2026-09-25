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
        $document = $this->service->loadDocument($page);

        return Inertia::render('builder', [
            'page' => $this->pageData($page),
            'document' => $document->toArray(),
            'save' => ['status' => 'saved', 'version' => (int) $page->document_version],
            'reusableComponents' => $this->reusableComponents->definitions($page->website->user),
            'templates' => array_map(fn ($template): array => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
            ], $this->templates->available($page->website->user)),
            'mediaAssets' => $page->website->user->mediaAssets()->where('status', 'active')->latest()->get(['id', 'user_id', 'storage_key', 'original_filename', 'mime_type', 'file_size', 'width', 'height', 'alt_text', 'status'])->map(function ($asset) use ($page): array {
                return [
                    'id' => $asset->id,
                    'originalFilename' => $asset->original_filename,
                    'mimeType' => $asset->mime_type,
                    'fileSize' => $asset->file_size,
                    'width' => $asset->width,
                    'height' => $asset->height,
                    'altText' => $asset->alt_text,
                    'status' => $asset->status,
                    'url' => $this->media->reference($page->website->user, $asset)->url,
                ];
            })->values()->all(),
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
