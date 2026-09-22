<?php

namespace App\Builder\Persistence;

use App\Builder\Document\BuilderDocument;
use App\Builder\Engine\ComponentTreeEngine;
use App\Builder\Engine\TreeInsertPosition;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Models\Page;
use App\Models\Template;
use App\Models\User;
use Illuminate\Support\Str;

final readonly class TemplatePersistenceService
{
    private DocumentPersistenceValidator $validator;

    public function __construct(
        ?DocumentPersistenceValidator $validator = null,
        private BuilderPagePersistenceService $pages = new BuilderPagePersistenceService,
        private DocumentNodeCloner $cloner = new DocumentNodeCloner,
    ) {
        $this->validator = $validator ?? new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
    }

    public function create(User $user, string $name, array $document, ?string $slug = null, ?string $description = null, string $type = 'page'): Template
    {
        $validated = $this->validator->validate($document);

        return $user->templates()->create([
            'name' => $name,
            'slug' => $slug ?? Str::slug($name),
            'description' => $description,
            'type' => $type,
            'document' => $validated->toArray(),
            'schema_version' => $validated->schemaVersion(),
            'status' => 'active',
        ]);
    }

    public function update(User $user, Template $template, array $document, ?string $name = null, ?string $description = null): Template
    {
        $this->assertOwner($user, $template);
        $validated = $this->validator->validate($document);
        $template->forceFill([
            'name' => $name ?? $template->name,
            'description' => $description ?? $template->description,
            'document' => $validated->toArray(),
            'schema_version' => $validated->schemaVersion(),
        ])->save();

        return $template->fresh();
    }

    /** @return list<Template> */
    public function available(User $user): array
    {
        $templates = $user->templates()->where('status', 'active')->latest()->get()->all();
        foreach ($templates as $template) {
            $this->validator->validate($template->document);
        }

        return $templates;
    }

    public function archive(User $user, Template $template): void
    {
        $this->assertOwner($user, $template);
        $template->forceFill(['status' => 'archived'])->save();
    }

    public function instantiate(User $user, Template $template, Page $page, string $parentId, int $expectedVersion): Page
    {
        $this->assertOwner($user, $template);
        $this->assertPageOwner($user, $page);
        $document = $this->validator->validate($template->document);
        $pageDocument = $this->pages->loadDocument($page);
        $data = $pageDocument->toArray();
        $used = $this->collectIds($data['root']);
        $engine = new ComponentTreeEngine(BuiltInComponentDefinitions::registry());
        $nodes = $document->toArray()['root']['type'] === 'layout.root' ? $document->toArray()['root']['children'] : [$document->toArray()['root']];

        foreach ($nodes as $node) {
            $copy = $this->cloner->clone($node, $used);
            $data = $engine->insert(BuilderDocument::fromArray($data), $parentId, $copy, TreeInsertPosition::append())->toArray();
        }

        return $this->pages->saveDraft($page, $data, $expectedVersion);
    }

    private function assertOwner(User $user, Template $template): void
    {
        abort_unless((int) $template->user_id === (int) $user->id, 403);
    }

    private function assertPageOwner(User $user, Page $page): void
    {
        abort_unless($page->website()->where('user_id', $user->id)->exists(), 403);
    }

    /** @param array<string, mixed> $node @return array<string, true> */
    private function collectIds(array $node): array
    {
        $ids = [$node['id'] => true];
        foreach ($node['children'] as $child) {
            $ids += $this->collectIds($child);
        }

        return $ids;
    }
}
