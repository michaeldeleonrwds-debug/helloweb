<?php

namespace App\Builder\Persistence;

use App\Builder\Document\BuilderDocument;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Models\Page;
use App\Models\PageRevision;
use App\Models\User;
use App\Models\Website;
use Illuminate\Support\Facades\DB;

final readonly class BuilderPagePersistenceService
{
    private DocumentPersistenceValidator $validator;

    private DefaultBuilderDocumentFactory $defaultDocuments;

    public function __construct(?DocumentPersistenceValidator $validator = null, ?DefaultBuilderDocumentFactory $defaultDocuments = null)
    {
        $this->validator = $validator ?? new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
        $this->defaultDocuments = $defaultDocuments ?? new DefaultBuilderDocumentFactory;
    }

    public function createWebsite(User $user, string $name, string $slug): Website
    {
        return $user->websites()->create([
            'name' => $name,
            'slug' => $slug,
            'status' => 'draft',
        ]);
    }

    public function createPage(Website $website, string $title, string $slug): Page
    {
        $document = $this->defaultDocuments->create();

        $page = $website->pages()->create([
            'title' => $title,
            'slug' => $slug,
            'status' => 'draft',
            'draft_document' => $document->toArray(),
            'document_schema_version' => $document->schemaVersion(),
            'document_version' => 0,
        ]);

        if ($website->homepage_page_id === null) {
            $website->forceFill(['homepage_page_id' => $page->id])->save();
        }

        return $page;
    }

    public function loadDocument(Page $page): BuilderDocument
    {
        return $this->validator->validate($page->draft_document);
    }

    public function saveDraft(Page $page, array $data, int $expectedVersion): Page
    {
        $document = $this->validator->validate($data);

        return DB::transaction(function () use ($page, $document, $expectedVersion): Page {
            $lockedPage = Page::query()->lockForUpdate()->findOrFail($page->id);
            $currentVersion = (int) $lockedPage->document_version;

            if ($currentVersion !== $expectedVersion) {
                throw new StaleDocumentException($expectedVersion, $currentVersion);
            }

            $lockedPage->forceFill([
                'draft_document' => $document->toArray(),
                'document_schema_version' => $document->schemaVersion(),
                'document_version' => $currentVersion + 1,
            ])->save();

            return $lockedPage->fresh(['currentRevision']);
        });
    }

    public function createRevision(Page $page, User $user): PageRevision
    {
        return DB::transaction(function () use ($page, $user): PageRevision {
            $lockedPage = Page::query()->lockForUpdate()->findOrFail($page->id);
            $document = $this->loadDocument($lockedPage);
            $number = ((int) $lockedPage->revisions()->max('revision_number')) + 1;
            $revision = $lockedPage->revisions()->create([
                'revision_number' => $number,
                'document' => $document->toArray(),
                'schema_version' => $document->schemaVersion(),
                'created_by' => $user->id,
                'type' => 'checkpoint',
            ]);
            $lockedPage->forceFill(['current_revision_id' => $revision->id])->save();

            return $revision;
        });
    }

    /** @return list<PageRevision> */
    public function revisions(Page $page): array
    {
        return $page->revisions()->latest('revision_number')->get()->all();
    }

    public function restoreRevision(Page $page, PageRevision $revision, User $user): PageRevision
    {
        return DB::transaction(function () use ($page, $revision, $user): PageRevision {
            $lockedPage = Page::query()->lockForUpdate()->findOrFail($page->id);
            $source = $lockedPage->revisions()->findOrFail($revision->id);
            $document = $this->validator->validate($source->document);
            $number = ((int) $lockedPage->revisions()->max('revision_number')) + 1;
            $restored = $lockedPage->revisions()->create([
                'revision_number' => $number,
                'document' => $document->toArray(),
                'schema_version' => $document->schemaVersion(),
                'created_by' => $user->id,
                'type' => 'restore',
            ]);
            $lockedPage->forceFill([
                'draft_document' => $document->toArray(),
                'document_schema_version' => $document->schemaVersion(),
                'document_version' => ((int) $lockedPage->document_version) + 1,
                'current_revision_id' => $restored->id,
            ])->save();

            return $restored;
        });
    }
}
