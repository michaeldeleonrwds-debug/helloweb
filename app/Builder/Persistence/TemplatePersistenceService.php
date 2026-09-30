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

    public function create(User $user, string $name, ?array $document = null, ?string $slug = null, ?string $description = null, string $type = 'page', ?bool $isPlatform = null, bool $isCustomized = true): Template
    {
        $doc = $document ?: DefaultTemplateFactory::documentForType($type);
        $validated = $this->validator->validate($doc);

        $targetSlug = $slug ?? Str::slug($name);
        $uniqueSlug = $targetSlug;
        $counter = 1;
        while ($user->templates()->where('slug', $uniqueSlug)->exists()) {
            $uniqueSlug = "{$targetSlug}-{$counter}";
            $counter++;
        }

        return $user->templates()->create([
            'name' => $name,
            'slug' => $uniqueSlug,
            'description' => $description,
            'type' => $type,
            'is_platform' => $isPlatform ?? $user->isSuperAdmin(),
            'is_customized' => $isCustomized,
            'document' => $validated->toArray(),
            'schema_version' => $validated->schemaVersion(),
            'status' => 'active',
        ]);
    }

    public function ensureDefaultTemplates(User $user): void
    {
        foreach (DefaultTemplateFactory::defaultTemplates() as $def) {
            $existing = Template::where('slug', $def['slug'])->where('status', 'active')->first();
            if (! $existing) {
                $this->create(
                    $user,
                    $def['name'],
                    $def['document'],
                    $def['slug'],
                    $def['description'],
                    $def['type'],
                    true,
                    false
                );

                continue;
            }

            if ($existing->is_platform && ! $existing->is_customized) {
                $validated = $this->validator->validate($def['document']);
                $existing->forceFill([
                    'name' => $def['name'],
                    'description' => $def['description'],
                    'type' => $def['type'],
                    'document' => $validated->toArray(),
                    'schema_version' => $validated->schemaVersion(),
                ])->save();
            }
        }

        $website = $user->websites()->first();
        if ($website) {
            $updates = [];
            if (! $website->header_template_id) {
                $mainHeader = Template::where('type', 'header')->where('status', 'active')
                    ->where(fn ($q) => $q->where('user_id', $user->id)->orWhere('is_platform', true))
                    ->first();
                if ($mainHeader) {
                    $updates['header_template_id'] = $mainHeader->id;
                }
            }
            if (! $website->footer_template_id) {
                $mainFooter = Template::where('type', 'footer')->where('status', 'active')
                    ->where(fn ($q) => $q->where('user_id', $user->id)->orWhere('is_platform', true))
                    ->first();
                if ($mainFooter) {
                    $updates['footer_template_id'] = $mainFooter->id;
                }
            }
            if (! empty($updates)) {
                $website->update($updates);
            }
        }
    }


    public function update(User $user, Template $template, array $document, ?string $name = null, ?string $description = null): Template
    {
        if ($template->is_platform && ! $user->isSuperAdmin()) {
            // Check if user already has an active custom fork of this platform template
            $existingFork = $user->templates()
                ->where('type', $template->type)
                ->where('status', 'active')
                ->where(function ($q) use ($template) {
                    $q->where('slug', $template->slug . '-custom')
                        ->orWhere('name', ($template->name . ' (Custom)'));
                })
                ->first();

            if ($existingFork) {
                // Repair a re-point that was missed on an earlier save.
                $this->reattachToWebsite($user, $template, $existingFork);

                return $this->update($user, $existingFork, $document, $name, $description);
            }

            // User is customizing a platform template: fork it for this user
            $forked = $this->create(
                $user,
                $name ?? ($template->name . ' (Custom)'),
                $document,
                $template->slug . '-custom',
                $description ?? $template->description,
                $template->type,
                false
            );

            $this->reattachToWebsite($user, $template, $forked);

            return $forked;
        }

        $this->assertOwner($user, $template);
        $validated = $this->validator->validate($document);
        $template->forceFill([
            'name' => $name ?? $template->name,
            'description' => $description ?? $template->description,
            'document' => $validated->toArray(),
            'schema_version' => $validated->schemaVersion(),
            'is_customized' => true,
        ])->save();

        return $template->fresh();
    }

    /**
     * Point the user's website at the forked template when it is currently
     * assigned to the platform original this fork replaces.
     */
    private function reattachToWebsite(User $user, Template $original, Template $replacement): void
    {
        $website = $user->websites()->first();
        if (! $website) {
            return;
        }

        $originalId = (int) $original->id;
        $updates = [];

        if ((int) $website->header_template_id === $originalId) {
            $updates['header_template_id'] = $replacement->id;
        }
        if ((int) $website->footer_template_id === $originalId) {
            $updates['footer_template_id'] = $replacement->id;
        }

        if ($updates !== []) {
            $website->update($updates);
        }
    }

    /** @return list<Template> */
    public function available(User $user): array
    {
        $templates = Template::where('status', 'active')
            ->where(fn ($q) => $q->where('user_id', $user->id)->orWhere('is_platform', true))
            ->latest()
            ->get()
            ->all();

        foreach ($templates as $template) {
            $this->validator->validate($template->document);
        }

        return $templates;
    }

    public function archive(User $user, Template $template): void
    {
        if ($template->is_platform && ! $user->isSuperAdmin()) {
            abort(403, 'Platform templates cannot be deleted.');
        }

        $this->assertOwner($user, $template);
        $template->forceFill(['status' => 'archived'])->save();
    }

    public function instantiate(User $user, Template $template, Page $page, string $parentId, int $expectedVersion): Page
    {
        $this->assertCanUseTemplate($user, $template);
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

    private function assertCanUseTemplate(User $user, Template $template): void
    {
        abort_unless((int) $template->user_id === (int) $user->id || (bool) $template->is_platform || $user->isSuperAdmin(), 403);
    }

    private function assertOwner(User $user, Template $template): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }
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
