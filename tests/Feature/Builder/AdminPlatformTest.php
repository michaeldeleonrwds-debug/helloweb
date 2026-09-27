<?php

namespace Tests\Feature\Builder;

use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Builder\Persistence\DefaultReusableComponentFactory;
use App\Builder\Persistence\DefaultTemplateFactory;
use App\Builder\Persistence\ReusableComponentService;
use App\Builder\Persistence\TemplatePersistenceService;
use App\Models\ReusableComponent;
use App\Models\Template;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPlatformTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_superadmin_cannot_access_platform_admin_panel(): void
    {
        $user = User::factory()->create(['is_superadmin' => false]);

        $this->actingAs($user)
            ->get(route('admin.platform.index'))
            ->assertStatus(403);
    }

    public function test_superadmin_can_access_platform_admin_and_see_catalog(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);

        $response = $this->actingAs($superadmin)->get(route('admin.platform.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('admin/index')
            ->has('templates')
            ->has('components')
            ->has('stats')
            ->where('stats.platformTemplates', fn ($count) => $count >= 6)
            ->where('stats.platformComponents', fn ($count) => $count >= 4)
        );
    }

    public function test_superadmin_can_toggle_platform_status_on_template(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);
        $template = (new TemplatePersistenceService)->create(
            $superadmin,
            'Toggleable Template',
            DefaultTemplateFactory::mainHeaderDocument(),
            null,
            null,
            'header',
            false
        );

        $this->assertFalse((bool) $template->is_platform);

        // Toggle to true
        $response = $this->actingAs($superadmin)
            ->postJson(route('admin.templates.toggle-platform', $template));

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('is_platform', true);
        $this->assertTrue((bool) $template->fresh()->is_platform);

        // Toggle back to false
        $response2 = $this->actingAs($superadmin)
            ->postJson(route('admin.templates.toggle-platform', $template));

        $response2->assertOk();
        $response2->assertJsonPath('is_platform', false);
        $this->assertFalse((bool) $template->fresh()->is_platform);
    }

    public function test_superadmin_can_toggle_platform_status_on_reusable_component(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);
        $component = (new ReusableComponentService)->create(
            $superadmin,
            'Toggleable Block',
            DefaultReusableComponentFactory::heroBlockDocument(),
            null,
            false
        );

        $this->assertFalse((bool) $component->is_platform);

        // Toggle to true
        $response = $this->actingAs($superadmin)
            ->postJson(route('admin.reusable.toggle-platform', $component));

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('is_platform', true);
        $this->assertTrue((bool) $component->fresh()->is_platform);

        // Toggle back to false
        $response2 = $this->actingAs($superadmin)
            ->postJson(route('admin.reusable.toggle-platform', $component));

        $response2->assertOk();
        $response2->assertJsonPath('is_platform', false);
        $this->assertFalse((bool) $component->fresh()->is_platform);
    }

    public function test_regular_user_can_view_and_instantiate_platform_template(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);
        $template = (new TemplatePersistenceService)->create(
            $superadmin,
            'Platform Theme Header',
            DefaultTemplateFactory::mainHeaderDocument(),
            null,
            null,
            'header',
            true
        );

        $regularUser = User::factory()->create(['is_superadmin' => false]);
        $website = app(BuilderPagePersistenceService::class)->createWebsite($regularUser, 'My Site', 'my-site');
        $page = $website->homepage;

        // View available templates
        $response = $this->actingAs($regularUser)->getJson(route('builder.templates.index'));
        $response->assertOk();
        $templateIds = collect($response->json('templates'))->pluck('id')->all();
        $this->assertContains($template->id, $templateIds);

        // Instantiate into page
        $instantiateResponse = $this->actingAs($regularUser)->postJson(
            route('builder.templates.instantiate', ['template' => $template, 'page' => $page]),
            ['parent_id' => 'root', 'expected_version' => 0]
        );

        $instantiateResponse->assertOk();
        $pageFresh = $page->fresh();
        $this->assertSame(1, $pageFresh->document_version);
        $this->assertNotEmpty($pageFresh->draft_document['root']['children']);
    }

    public function test_regular_user_cannot_archive_platform_template(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);
        $template = (new TemplatePersistenceService)->create(
            $superadmin,
            'Platform Locked Template',
            DefaultTemplateFactory::mainHeaderDocument(),
            null,
            null,
            'header',
            true
        );

        $regularUser = User::factory()->create(['is_superadmin' => false]);

        $this->actingAs($regularUser)
            ->postJson(route('builder.templates.archive', $template))
            ->assertStatus(403);

        $this->assertSame('active', $template->fresh()->status);

        // Superadmin CAN archive it
        $this->actingAs($superadmin)
            ->postJson(route('builder.templates.archive', $template))
            ->assertOk();

        $this->assertSame('archived', $template->fresh()->status);
    }

    public function test_regular_user_can_insert_platform_reusable_component(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);
        $component = (new ReusableComponentService)->create(
            $superadmin,
            'Platform Hero Block',
            DefaultReusableComponentFactory::heroBlockDocument(),
            null,
            true
        );

        $regularUser = User::factory()->create(['is_superadmin' => false]);
        $website = app(BuilderPagePersistenceService::class)->createWebsite($regularUser, 'Client Site', 'client-site');
        $page = $website->homepage;

        // View available reusable components
        $response = $this->actingAs($regularUser)->getJson(route('builder.reusable.index'));
        $response->assertOk();
        $componentIds = collect($response->json('components'))->pluck('id')->all();
        $this->assertContains($component->id, $componentIds);

        $column = $page->draft_document['root']['children'][0]['children'][0]['children'][0];

        // Insert into page column
        $insertResponse = $this->actingAs($regularUser)->postJson(
            route('builder.reusable.insert', ['component' => $component, 'page' => $page]),
            ['parent_id' => $column['id'], 'expected_version' => 0]
        );

        $insertResponse->assertOk();
        $pageFresh = $page->fresh();
        $this->assertSame(1, $pageFresh->document_version);
        $colChildren = $pageFresh->draft_document['root']['children'][0]['children'][0]['children'][0]['children'];
        $lastChild = end($colChildren);
        $this->assertSame('reusable.instance', $lastChild['type']);
        $this->assertSame($component->id, $lastChild['reusableReference']['id']);
    }

    public function test_regular_user_cannot_archive_platform_reusable_component(): void
    {
        $superadmin = User::factory()->create(['is_superadmin' => true]);
        $component = (new ReusableComponentService)->create(
            $superadmin,
            'Platform Locked Block',
            DefaultReusableComponentFactory::heroBlockDocument(),
            null,
            true
        );

        $regularUser = User::factory()->create(['is_superadmin' => false]);

        $this->actingAs($regularUser)
            ->postJson(route('builder.reusable.archive', $component))
            ->assertStatus(403);

        $this->assertSame('active', $component->fresh()->status);

        // Superadmin CAN archive it
        $this->actingAs($superadmin)
            ->postJson(route('builder.reusable.archive', $component))
            ->assertOk();

        $this->assertSame('archived', $component->fresh()->status);
    }
}
