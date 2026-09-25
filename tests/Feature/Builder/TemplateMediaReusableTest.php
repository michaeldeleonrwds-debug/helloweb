<?php

namespace Tests\Feature\Builder;

use App\Builder\Media\MediaAssetService;
use App\Builder\Media\MediaStorage;
use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Builder\Persistence\ReusableComponentService;
use App\Builder\Persistence\TemplatePersistenceService;
use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class TemplateMediaReusableTest extends TestCase
{
    use RefreshDatabase;

    public function test_template_lifecycle_and_independent_instantiation(): void
    {
        [$page, $user] = $this->page();
        $source = $page->draft_document['root']['children'][0];
        $source['styles']['mobile'] = ['padding' => '20px'];
        $template = (new TemplatePersistenceService)->create($user, 'Hero section', ['schemaVersion' => 1, 'root' => $source]);

        $updated = (new TemplatePersistenceService)->instantiate($user, $template, $page, 'root', 0);
        $inserted = $updated->fresh()->draft_document['root']['children'][1];

        $this->assertNotSame($source['id'], $inserted['id']);
        $this->assertNotSame($source['children'][0]['id'], $inserted['children'][0]['id']);
        $this->assertSame($source['styles'], $inserted['styles']);
        $this->assertSame('layout.row', $inserted['children'][0]['type']);
        $this->assertSame($source['id'], $template->fresh()->document['root']['id']);
    }

    public function test_template_schema_and_owner_are_enforced(): void
    {
        [$page, $user] = $this->page();
        $templates = new TemplatePersistenceService;
        $template = $templates->create($user, 'Valid', $page->draft_document);
        $other = User::factory()->create();

        $this->expectException(HttpException::class);
        $templates->archive($other, $template);
    }

    public function test_invalid_template_schema_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        (new TemplatePersistenceService)->create(User::factory()->create(), 'Invalid', ['schemaVersion' => 999, 'root' => []]);
    }

    public function test_reusable_component_is_a_reference_not_a_copy(): void
    {
        [$page, $user] = $this->page();
        $column = $page->draft_document['root']['children'][0]['children'][0]['children'][0];
        $source = $column['children'][0];
        $service = new ReusableComponentService;
        $component = $service->create($user, 'Shared heading', ['schemaVersion' => 1, 'root' => $source]);

        $updated = $service->insert($user, $component, $page, $column['id'], 0);
        $children = $updated->fresh()->draft_document['root']['children'][0]['children'][0]['children'][0]['children'];
        $instance = end($children);

        $this->assertSame('reusable.instance', $instance['type']);
        $this->assertSame(['type' => 'reusable-component', 'id' => $component->id], $instance['reusableReference']);
        $this->assertSame([], $instance['children']);
        $this->assertSame($source['id'], $component->fresh()->document['root']['id']);
    }

    public function test_reusable_component_cannot_cross_ownership_boundaries(): void
    {
        [$page] = $this->page();
        $owner = User::findOrFail($page->website->user_id);
        $other = User::factory()->create();
        $component = (new ReusableComponentService)->create($other, 'Private', ['schemaVersion' => 1, 'root' => $page->draft_document['root']['children'][0]]);

        $this->expectException(HttpException::class);
        (new ReusableComponentService)->insert($owner, $component, $page, 'root', 0);
    }

    public function test_media_uses_storage_abstraction_and_enforces_owner(): void
    {
        $storage = new class implements MediaStorage
        {
            /** @var array<string, string> */
            public array $files = [];

            public function store(string $key, string $contents, string $mimeType): void
            {
                $this->files[$key] = $contents;
            }

            public function delete(string $key): void
            {
                unset($this->files[$key]);
            }

            public function url(string $key): string
            {
                return 'memory://'.$key;
            }
        };
        $user = User::factory()->create();
        $other = User::factory()->create();
        $service = new MediaAssetService($storage);
        $asset = $service->store($user, 'photo.png', 'image/png', 'binary-image', ['altText' => 'A photo', 'width' => 20]);

        $this->assertSame('binary-image', $storage->files[$asset->storage_key]);
        $this->assertSame(['type' => 'media-asset', 'id' => $asset->id, 'mimeType' => 'image/png', 'url' => 'memory://'.$asset->storage_key, 'altText' => 'A photo'], $service->reference($user, $asset)->toArray());
        $this->actingAs($user)->getJson(route('builder.media.index'))->assertOk();

        $this->expectException(HttpException::class);
        $service->archive($other, $asset);
    }

    /** @return array{Page, User} */
    private function page(): array
    {
        $user = User::factory()->create();
        $service = new BuilderPagePersistenceService;
        $website = $service->createWebsite($user, 'Templates', 'templates-'.$user->id);

        return [$website->homepage, $user];
    }
}
