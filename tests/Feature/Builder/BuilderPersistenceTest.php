<?php

namespace Tests\Feature\Builder;

use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Builder\Persistence\StaleDocumentException;
use App\Models\Page;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class BuilderPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_website_page_and_revision_relationships_persist_structured_documents(): void
    {
        $user = User::factory()->create();
        $service = new BuilderPagePersistenceService;
        $website = $service->createWebsite($user, 'Example', 'example');
        $page = $service->createPage($website, 'Home', 'home');

        $this->assertTrue($user->websites()->whereKey($website)->exists());
        $this->assertTrue($website->pages()->whereKey($page)->exists());
        $this->assertSame(1, $page->draft_document['schemaVersion']);
        $this->assertSame('layout.root', $page->draft_document['root']['type']);

        $revision = $service->createRevision($page, $user);

        $this->assertSame(1, $revision->revision_number);
        $this->assertSame($revision->id, $page->fresh()->current_revision_id);
        $this->assertSame($page->id, $revision->page->id);
    }

    public function test_page_slugs_are_unique_per_website_but_not_globally(): void
    {
        $service = new BuilderPagePersistenceService;
        $first = $service->createWebsite(User::factory()->create(), 'First', 'first');
        $second = $service->createWebsite(User::factory()->create(), 'Second', 'second');

        $service->createPage($first, 'Home', 'home');
        $service->createPage($second, 'Home', 'home');

        $this->expectException(UniqueConstraintViolationException::class);
        $service->createPage($first, 'Another Home', 'home');
    }

    public function test_valid_document_is_saved_and_loaded_without_structure_loss(): void
    {
        [$page, $user] = $this->page();
        $document = $page->draft_document;
        $document['root']['children'][0]['children'][0]['children'][0]['props']['text'] = 'Persisted';

        $saved = (new BuilderPagePersistenceService)->saveDraft($page, $document, 0);

        $this->assertSame(1, $saved->document_version);
        $this->assertSame('Persisted', (new BuilderPagePersistenceService)->loadDocument($saved)->toArray()['root']['children'][0]['children'][0]['children'][0]['props']['text']);
    }

    public function test_invalid_document_is_rejected_before_persistence(): void
    {
        [$page] = $this->page();
        $invalid = $page->draft_document;
        $invalid['schemaVersion'] = 999;

        $this->expectException(\InvalidArgumentException::class);
        (new BuilderPagePersistenceService)->saveDraft($page, $invalid, 0);
    }

    public function test_invalid_persisted_document_is_rejected_on_load(): void
    {
        [$page] = $this->page();
        $page->forceFill(['draft_document' => ['schemaVersion' => 999]])->save();

        $this->expectException(\InvalidArgumentException::class);
        (new BuilderPagePersistenceService)->loadDocument($page->fresh());
    }

    public function test_legacy_section_container_documents_are_normalized_on_load(): void
    {
        [$page] = $this->page();
        $legacy = $page->draft_document;
        $section = &$legacy['root']['children'][0];
        $section['children'][0]['type'] = 'layout.container';
        $section['children'][0]['id'] = 'legacy-container';

        $page->forceFill(['draft_document' => $legacy])->save();
        $document = (new BuilderPagePersistenceService)->loadDocument($page->fresh())->toArray();
        $row = $document['root']['children'][0]['children'][0];
        $column = $row['children'][0];

        $this->assertSame('layout.row', $row['type']);
        $this->assertSame('layout.column', $column['type']);
        $this->assertSame('layout.container', $column['children'][0]['type']);
    }

    public function test_stale_draft_save_is_rejected_without_overwriting_newer_document(): void
    {
        [$page] = $this->page();
        $service = new BuilderPagePersistenceService;
        $first = $page->draft_document;
        $first['metadata'] = ['source' => 'first'];
        $service->saveDraft($page, $first, 0);
        $stale = $page->draft_document;
        $stale['metadata'] = ['source' => 'stale'];

        $this->expectException(StaleDocumentException::class);
        $service->saveDraft($page->fresh(), $stale, 0);
    }

    public function test_revision_numbers_are_page_scoped_and_historical_documents_are_immutable(): void
    {
        [$page, $user] = $this->page();
        $service = new BuilderPagePersistenceService;
        $first = $service->createRevision($page, $user);
        $changed = $page->fresh()->draft_document;
        $changed['metadata'] = ['revision' => 2];
        $service->saveDraft($page->fresh(), $changed, 0);
        $second = $service->createRevision($page->fresh(), $user);

        $this->assertSame(1, $first->revision_number);
        $this->assertSame(2, $second->revision_number);
        $this->assertSame([], $first->fresh()->document['metadata'] ?? []);
    }

    public function test_restore_creates_a_new_revision_and_preserves_the_source_revision(): void
    {
        [$page, $user] = $this->page();
        $service = new BuilderPagePersistenceService;
        $original = $service->createRevision($page, $user);
        $changed = $page->fresh()->draft_document;
        $changed['metadata'] = ['changed' => true];
        $service->saveDraft($page->fresh(), $changed, 0);
        $restored = $service->restoreRevision($page->fresh(), $original, $user);

        $this->assertSame(2, $restored->revision_number);
        $this->assertSame([], $original->fresh()->document['metadata'] ?? []);
        $this->assertSame([], $page->fresh()->draft_document['metadata'] ?? []);
    }

    public function test_page_endpoints_require_ownership(): void
    {
        [$page, $owner] = $this->page();
        $other = User::factory()->create();
        $this->actingAs($other)->getJson(route('builder.pages.revisions.index', $page))->assertForbidden();
        $this->actingAs($other)->get(route('builder.pages.show', $page))->assertForbidden();
        $this->actingAs($other)->patchJson(route('builder.pages.document.update', $page), [
            'document' => $page->draft_document,
            'expected_version' => 0,
        ])->assertForbidden();

        $this->withoutExceptionHandling();
        $this->actingAs($owner)->get(route('builder.pages.show', $page))->assertOk()->assertInertia(fn ($assertion) => $assertion
            ->component('builder')
            ->where('page.id', $page->id)
            ->where('document.schemaVersion', 1));
    }

    public function test_owner_can_open_builder_page_with_media_assets_loaded(): void
    {
        [$page, $owner] = $this->page();
        $asset = $owner->mediaAssets()->create([
            'original_filename' => 'hero.png',
            'storage_disk' => 'public',
            'storage_key' => 'builder/'.$owner->id.'/hero.png',
            'mime_type' => 'image/png',
            'file_size' => 12,
            'status' => 'active',
        ]);
        $this->actingAs($owner)->get(route('builder.pages.show', $page))->assertOk()->assertInertia(fn ($assertion) => $assertion
            ->component('builder')
            ->where('page.id', $page->id)
            ->where('mediaAssets.0.originalFilename', 'hero.png')
            ->where('mediaAssets.0.url', '/storage/builder/'.$owner->id.'/hero.png'));
    }

    public function test_image_document_can_be_saved(): void
    {
        [$page, $owner] = $this->page();
        $document = $page->draft_document;
        $document['root']['children'][0]['children'][0]['children'][0]['children'][] = [
            'id' => 'image-test',
            'type' => 'media.image',
            'props' => ['src' => '/storage/builder/'.$owner->id.'/hero.png', 'alt' => null],
            'styles' => [],
            'children' => [],
        ];
        $document['root']['children'][0]['children'][0]['styles']['desktop']['margin'] = '0 auto';
        $document['root']['children'][0]['styles']['desktop']['backgroundType'] = 'image';
        $document['root']['children'][0]['styles']['desktop']['backgroundImage'] = ['url' => '/storage/builder/'.$owner->id.'/hero.png', 'id' => 1];

        $this->actingAs($owner)->patchJson(route('builder.pages.document.update', $page), [
            'document' => $document,
            'expected_version' => 0,
        ])->assertOk()->assertJsonPath('save.version', 1);
    }

    public function test_document_endpoint_returns_save_version_and_rejects_stale_versions(): void
    {
        [$page, $owner] = $this->page();
        $document = $page->draft_document;
        $document['metadata'] = ['saved' => true];

        $this->actingAs($owner)->patchJson(route('builder.pages.document.update', $page), [
            'document' => $document,
            'expected_version' => 0,
        ])->assertOk()->assertJsonPath('save.version', 1);

        $document['metadata'] = ['stale' => true];
        $this->actingAs($owner)->patchJson(route('builder.pages.document.update', $page), [
            'document' => $document,
            'expected_version' => 0,
        ])->assertStatus(409)->assertJsonPath('save.status', 'stale');

        $this->assertSame(['saved' => true], $page->fresh()->draft_document['metadata']);
    }

    /** @return array{Page, User} */
    private function page(): array
    {
        $user = User::factory()->create();
        $service = new BuilderPagePersistenceService;
        $website = $service->createWebsite($user, 'Example '.Str::random(4), 'example-'.Str::lower(Str::random(4)));

        return [$service->createPage($website, 'Home', 'home'), $user];
    }
}
