<?php

namespace App\Builder\Persistence;

use App\Builder\Document\BuilderDocument;
use App\Builder\Engine\ComponentTreeEngine;
use App\Builder\Engine\TreeInsertPosition;
use App\Builder\Registry\BuiltInComponentDefinitions;
use App\Models\Page;
use App\Models\ReusableComponent;
use App\Models\User;
use Illuminate\Support\Str;

final readonly class ReusableComponentService
{
    private DocumentPersistenceValidator $validator;

    public function __construct(
        ?DocumentPersistenceValidator $validator = null,
        private BuilderPagePersistenceService $pages = new BuilderPagePersistenceService,
    ) {
        $this->validator = $validator ?? new DocumentPersistenceValidator(BuiltInComponentDefinitions::registry());
    }

    public function create(User $user, string $name, array $document, ?string $description = null): ReusableComponent
    {
        $validated = $this->validator->validate($document);

        return $user->reusableComponents()->create([
            'name' => $name,
            'description' => $description,
            'document' => $validated->toArray(),
            'schema_version' => $validated->schemaVersion(),
            'status' => 'active',
        ]);
    }

    /** @return list<ReusableComponent> */
    public function available(User $user): array
    {
        $components = $user->reusableComponents()->where('status', 'active')->latest()->get()->all();
        foreach ($components as $component) {
            $this->validator->validate($component->document);
        }

        return $components;
    }

    public function update(User $user, ReusableComponent $component, array $document, ?string $name = null): ReusableComponent
    {
        $this->assertOwner($user, $component);
        $validated = $this->validator->validate($document);
        $component->forceFill([
            'name' => $name ?? $component->name,
            'document' => $validated->toArray(),
            'schema_version' => $validated->schemaVersion(),
        ])->save();

        return $component->fresh();
    }

    public function archive(User $user, ReusableComponent $component): void
    {
        $this->assertOwner($user, $component);
        $component->forceFill(['status' => 'archived'])->save();
    }

    public function insert(User $user, ReusableComponent $component, Page $page, string $parentId, int $expectedVersion): Page
    {
        $this->assertOwner($user, $component);
        abort_unless($page->website()->where('user_id', $user->id)->exists(), 403);
        $this->validator->validate($component->document);
        $pageDocument = $this->pages->loadDocument($page);
        $data = $pageDocument->toArray();
        $instance = [
            'id' => 'reusable-'.Str::lower(Str::random(16)),
            'type' => 'reusable.instance',
            'props' => [],
            'styles' => [],
            'children' => [],
            'reusableReference' => ['type' => 'reusable-component', 'id' => $component->id],
        ];
        $engine = new ComponentTreeEngine(BuiltInComponentDefinitions::registry());
        $updated = $engine->insert(BuilderDocument::fromArray($data), $parentId, $instance, TreeInsertPosition::append());

        return $this->pages->saveDraft($page, $updated->toArray(), $expectedVersion);
    }

    /** @return list<array<string, mixed>> */
    public function definitions(User $user): array
    {
        return array_map(static fn (ReusableComponent $component): array => [
            'id' => $component->id,
            'name' => $component->name,
            'description' => $component->description,
            'document' => $component->document,
        ], $this->available($user));
    }

    private function assertOwner(User $user, ReusableComponent $component): void
    {
        abort_unless((int) $component->user_id === (int) $user->id, 403);
    }
}
