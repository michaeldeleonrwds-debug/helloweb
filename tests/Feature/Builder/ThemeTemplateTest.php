<?php

namespace Tests\Feature\Builder;

use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Builder\Persistence\DefaultTemplateFactory;
use App\Builder\Persistence\TemplatePersistenceService;
use App\Models\Template;
use App\Models\User;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ThemeTemplateTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_templates_index_ensures_default_theme_templates_are_seeded(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('templates.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('templates/index')
            ->has('templates', 16)
        );

        $this->assertDatabaseHas('templates', [
            'user_id' => $user->id,
            'type' => 'header',
            'name' => 'Main Navigation Header',
        ]);

        $this->assertDatabaseHas('templates', [
            'user_id' => $user->id,
            'type' => 'footer',
            'name' => 'Multi-Column Footer',
        ]);

        $this->assertDatabaseHas('templates', [
            'user_id' => $user->id,
            'type' => 'header',
            'slug' => 'split-cta-header',
        ]);

        $this->assertDatabaseHas('templates', [
            'user_id' => $user->id,
            'type' => 'footer',
            'slug' => 'editorial-footer',
        ]);

        $this->assertDatabaseHas('templates', [
            'user_id' => $user->id,
            'type' => 'page',
            'slug' => 'local-service-blueprint',
        ]);
    }

    public function test_default_platform_templates_are_refreshed_by_slug(): void
    {
        $user = User::factory()->create();

        $staleDocument = DefaultTemplateFactory::newsletterFooterDocument();
        $this->assertEmpty($staleDocument['root']['children'][0]['styles']['mobile'] ?? []);

        $template = Template::query()->create([
            'user_id' => $user->id,
            'name' => 'Old SaaS Newsletter Footer',
            'slug' => 'saas-newsletter-footer',
            'description' => 'Old non-responsive footer.',
            'type' => 'footer',
            'is_platform' => true,
            'document' => $staleDocument,
            'schema_version' => 1,
            'status' => 'active',
        ]);

        $this->actingAs($user)->get(route('templates.index'))->assertOk();

        $refreshed = $template->fresh();
        $this->assertSame('SaaS Newsletter Footer', $refreshed->name);
        $this->assertSame('1.5rem 1rem', $refreshed->document['root']['children'][0]['styles']['mobile']['padding'] ?? null);
        $this->assertSame('column', $refreshed->document['root']['children'][0]['children'][0]['styles']['mobile']['flexDirection'] ?? null);
    }

    public function test_user_can_create_new_global_header_template(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson(route('builder.templates.store'), [
            'name' => 'Custom Store Header',
            'type' => 'header',
            'description' => 'Header for shop pages',
        ]);

        $response->assertCreated();
        $response->assertJsonStructure(['template' => ['id', 'name', 'type'], 'builderUrl']);

        $this->assertDatabaseHas('templates', [
            'user_id' => $user->id,
            'name' => 'Custom Store Header',
            'type' => 'header',
        ]);
    }

    public function test_user_can_create_new_global_footer_template(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson(route('builder.templates.store'), [
            'name' => 'Minimal Dark Footer',
            'type' => 'footer',
            'description' => 'Compact dark footer',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('templates', [
            'user_id' => $user->id,
            'name' => 'Minimal Dark Footer',
            'type' => 'footer',
        ]);
    }

    public function test_user_can_open_template_in_builder(): void
    {
        $user = User::factory()->create();
        $template = (new TemplatePersistenceService)->create(
            $user,
            'Brand Header',
            DefaultTemplateFactory::mainHeaderDocument(),
            'brand-header',
            'Primary header',
            'header'
        );

        $response = $this->actingAs($user)->get(route('builder.templates.show', $template));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('builder')
            ->where('isTemplate', true)
            ->where('template.id', $template->id)
            ->where('template.type', 'header')
            ->where('template.name', 'Brand Header')
        );
    }

    public function test_user_can_update_template_document_in_builder(): void
    {
        $user = User::factory()->create();
        $template = (new TemplatePersistenceService)->create(
            $user,
            'My Header',
            DefaultTemplateFactory::mainHeaderDocument(),
            'my-header',
            'Primary header',
            'header'
        );

        $updatedDoc = $template->document;
        $updatedDoc['root']['children'][0]['props']['brandName'] = 'CustomBrand';

        $response = $this->actingAs($user)->patchJson(route('builder.templates.document.update', $template), [
            'document' => $updatedDoc,
        ]);

        $response->assertOk();
        $response->assertJsonPath('save.status', 'saved');

        $this->assertSame(
            'CustomBrand',
            $template->fresh()->document['root']['children'][0]['props']['brandName']
        );
    }

    public function test_regular_user_can_customize_platform_template_repeatedly_without_duplicate_slug_error(): void
    {
        $admin = User::factory()->create(['is_superadmin' => true]);
        $user = User::factory()->create(['is_superadmin' => false]);
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($user, 'User Site', 'user-site');

        $templates = new TemplatePersistenceService;
        $platformHeader = $templates->create(
            $admin,
            'Platform Glow Header',
            DefaultTemplateFactory::darkGlowHeaderDocument(),
            'platform-glow-header',
            'Superadmin header',
            'header',
            true
        );

        $website->update(['header_template_id' => $platformHeader->id]);

        // First autosave/update from regular user on platform template
        $doc1 = $platformHeader->document;
        $doc1['root']['children'][0]['props']['brandName'] = 'UserBrand 1';

        $res1 = $this->actingAs($user)->patchJson(route('builder.templates.document.update', $platformHeader), [
            'document' => $doc1,
        ]);

        $res1->assertOk();
        $res1->assertJsonPath('save.status', 'saved');
        $forkedId1 = $res1->json('template.id');
        $this->assertNotEquals($platformHeader->id, $forkedId1);

        // Second autosave/update from regular user (must not throw 1062 duplicate slug error!)
        $doc2 = $doc1;
        $doc2['root']['children'][0]['props']['brandName'] = 'UserBrand 2';

        $res2 = $this->actingAs($user)->patchJson(route('builder.templates.document.update', $platformHeader), [
            'document' => $doc2,
        ]);

        $res2->assertOk();
        $res2->assertJsonPath('save.status', 'saved');
        $forkedId2 = $res2->json('template.id');
        // It updates the existing user fork
        $this->assertSame($forkedId1, $forkedId2);

        $this->assertSame(
            'UserBrand 2',
            Template::find($forkedId2)->document['root']['children'][0]['props']['brandName']
        );
    }

    public function test_superadmin_can_update_platform_template_directly(): void
    {
        $admin = User::factory()->create(['is_superadmin' => true]);
        $templates = new TemplatePersistenceService;
        $platformHeader = $templates->create(
            $admin,
            'Platform Header Direct',
            DefaultTemplateFactory::darkGlowHeaderDocument(),
            'platform-header-direct',
            'Superadmin header',
            'header',
            true
        );

        $doc = $platformHeader->document;
        $doc['root']['children'][0]['props']['brandName'] = 'AdminDirectBrand';

        $res = $this->actingAs($admin)->patchJson(route('builder.templates.document.update', $platformHeader), [
            'document' => $doc,
        ]);

        $res->assertOk();
        $res->assertJsonPath('save.status', 'saved');
        $this->assertSame($platformHeader->id, $res->json('template.id'));
        $this->assertSame(
            'AdminDirectBrand',
            $platformHeader->fresh()->document['root']['children'][0]['props']['brandName']
        );
    }

    public function test_website_can_configure_global_header_and_footer(): void
    {
        $user = User::factory()->create();
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($user, 'Acme Site', 'acme-site');
        $home = $website->homepage;

        $templates = new TemplatePersistenceService;
        $header = $templates->create($user, 'Global Nav', DefaultTemplateFactory::mainHeaderDocument(), null, null, 'header');
        $footer = $templates->create($user, 'Global Foot', DefaultTemplateFactory::multiColumnFooterDocument(), null, null, 'footer');

        $response = $this->actingAs($user)->patch(route('website.settings.update'), [
            'name' => 'Acme Site Updated',
            'homepage_page_id' => $home->id,
            'header_template_id' => $header->id,
            'footer_template_id' => $footer->id,
        ]);

        $response->assertRedirect();
        $this->assertSame($header->id, $website->fresh()->header_template_id);
        $this->assertSame($footer->id, $website->fresh()->footer_template_id);
    }

    public function test_public_site_renders_with_assigned_global_header_and_footer(): void
    {
        $user = User::factory()->create();
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($user, 'Store Corp', 'store-corp');
        $home = $website->homepage;

        $templates = new TemplatePersistenceService;
        $header = $templates->create($user, 'Store Nav', DefaultTemplateFactory::mainHeaderDocument(), null, null, 'header');
        $footer = $templates->create($user, 'Store Foot', DefaultTemplateFactory::multiColumnFooterDocument(), null, null, 'footer');

        $website->update([
            'header_template_id' => $header->id,
            'footer_template_id' => $footer->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('public-site')
            ->has('headerDocument')
            ->has('footerDocument')
        );
    }

    public function test_user_can_update_theme_layout_inside_builder(): void
    {
        $user = User::factory()->create();
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($user, 'Theme Site', 'theme-site');
        $home = $website->homepage;

        $templates = new TemplatePersistenceService;
        $header = $templates->create($user, 'Cool Header', DefaultTemplateFactory::darkGlowHeaderDocument(), 'cool-header', null, 'header');
        $footer = $templates->create($user, 'Cool Footer', DefaultTemplateFactory::newsletterFooterDocument(), 'cool-footer', null, 'footer');

        $response = $this->actingAs($user)->patchJson(route('builder.pages.theme-layout.update', $home), [
            'header_template_id' => $header->id,
            'footer_template_id' => $footer->id,
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'headerTemplateId' => $header->id,
            'footerTemplateId' => $footer->id,
        ]);
        $response->assertJsonStructure([
            'headerDocument',
            'footerDocument',
        ]);

        $this->assertSame($header->id, $website->fresh()->header_template_id);
        $this->assertSame($footer->id, $website->fresh()->footer_template_id);

        $responseNull = $this->actingAs($user)->patchJson(route('builder.pages.theme-layout.update', $home), [
            'header_template_id' => null,
            'footer_template_id' => null,
        ]);

        $responseNull->assertOk();
        $responseNull->assertJson([
            'success' => true,
            'headerTemplateId' => null,
            'footerTemplateId' => null,
            'headerDocument' => null,
            'footerDocument' => null,
        ]);

        $this->assertNull($website->fresh()->header_template_id);
        $this->assertNull($website->fresh()->footer_template_id);
    }

    public function test_superadmin_customized_platform_header_survives_editor_reload(): void
    {
        $admin = User::factory()->create(['is_superadmin' => true]);
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($admin, 'Persisted Site', 'persisted-site');

        $this->actingAs($admin)->get(route('templates.index'))->assertOk();

        $website = $website->fresh(['homepage']);
        $header = Template::find($website->header_template_id);
        $this->assertNotNull($header);
        $this->assertTrue((bool) $header->is_platform);
        $this->assertFalse((bool) $header->is_customized);

        $doc = $header->document;
        $doc['root']['children'][0]['props']['brandName'] = 'PersistedBrand';

        $this->actingAs($admin)
            ->patchJson(route('builder.templates.document.update', $header), ['document' => $doc])
            ->assertOk()
            ->assertJsonPath('save.status', 'saved');

        $saved = $header->fresh()->document;
        $this->assertSame('PersistedBrand', $saved['root']['children'][0]['props']['brandName']);

        $this->actingAs($admin)->get(route('builder.pages.show', $website->homepage))->assertOk();

        $this->assertSame($saved, $header->fresh()->document);
    }

    public function test_fresh_platform_header_is_still_refreshed_until_customized(): void
    {
        $admin = User::factory()->create(['is_superadmin' => true]);
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($admin, 'Refresh Site', 'refresh-site');

        $this->actingAs($admin)->get(route('templates.index'))->assertOk();

        $website = $website->fresh(['homepage']);
        $header = Template::find($website->header_template_id);

        $stale = $header->document;
        $stale['root']['children'][0]['props']['brandName'] = 'StaleBrand';
        $header->forceFill(['document' => $stale, 'is_customized' => false])->save();

        $this->actingAs($admin)->get(route('builder.pages.show', $website->homepage))->assertOk();

        $this->assertSame(
            'HelloWeb',
            $header->fresh()->document['root']['children'][0]['props']['brandName']
        );
    }

    public function test_customizing_platform_header_repoints_website_to_user_fork(): void
    {
        $admin = User::factory()->create(['is_superadmin' => true]);
        $user = User::factory()->create(['is_superadmin' => false]);
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($user, 'Fork Site', 'fork-site');

        $templates = new TemplatePersistenceService;
        $platformHeader = $templates->create(
            $admin,
            'Platform Fork Header',
            DefaultTemplateFactory::darkGlowHeaderDocument(),
            'platform-fork-header',
            null,
            'header',
            true,
            false
        );
        $website->update(['header_template_id' => $platformHeader->id]);

        $doc = $platformHeader->document;
        $doc['root']['children'][0]['props']['brandName'] = 'ForkedBrand';

        $response = $this->actingAs($user)
            ->patchJson(route('builder.templates.document.update', $platformHeader), ['document' => $doc])
            ->assertOk();

        $forkedId = $response->json('template.id');
        $this->assertNotEquals($platformHeader->id, $forkedId);
        $this->assertSame($forkedId, $website->fresh()->header_template_id);

        $doc['root']['children'][0]['props']['brandName'] = 'ForkedBrandAgain';
        $this->actingAs($user)
            ->patchJson(route('builder.templates.document.update', $platformHeader), ['document' => $doc])
            ->assertOk();

        $this->assertSame($forkedId, $website->fresh()->header_template_id);
        $this->assertSame(
            'ForkedBrandAgain',
            Template::find($forkedId)->document['root']['children'][0]['props']['brandName']
        );
    }

    public function test_template_preview_overlays_header_on_site_page(): void
    {
        $user = User::factory()->create();
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($user, 'Preview Site', 'preview-site');

        $templates = new TemplatePersistenceService;
        $assignedHeader = $templates->create($user, 'Assigned Header', DefaultTemplateFactory::mainHeaderDocument(), 'assigned-header', null, 'header');

        $previewDoc = DefaultTemplateFactory::darkGlowHeaderDocument();
        $previewDoc['root']['children'][0]['props']['brandName'] = 'PreviewOnlyBrand';
        $previewHeader = $templates->create($user, 'Preview Header', $previewDoc, 'preview-header', null, 'header');

        $website->update(['header_template_id' => $assignedHeader->id]);

        $response = $this->actingAs($user)->get(route('preview.templates.show', $previewHeader));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('public-site')
            ->where('isPreview', true)
            ->where('page.id', $website->homepage_page_id)
            ->where('headerDocument.root.children.0.props.brandName', 'PreviewOnlyBrand')
        );
    }

    public function test_template_preview_renders_page_template_as_body(): void
    {
        $user = User::factory()->create();
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($user, 'Page Preview Site', 'page-preview-site');

        $templates = new TemplatePersistenceService;
        $pageDoc = DefaultTemplateFactory::documentForType('page');
        $this->assertTrue($this->setFirstTextNode($pageDoc['root'], 'PreviewOnlyBody'));
        $pageTemplate = $templates->create($user, 'Preview Page', $pageDoc, 'preview-page', null, 'page');

        $response = $this->actingAs($user)->get(route('preview.templates.show', $pageTemplate));

        $response->assertOk();
        $this->assertStringContainsString('PreviewOnlyBody', $response->getContent());
        $response->assertInertia(fn ($page) => $page
            ->component('public-site')
            ->where('isPreview', true)
            ->where('page.id', $website->homepage_page_id)
            ->where('headerDocument', null)
            ->where('footerDocument', null)
            ->where('document', $pageTemplate->document)
        );
    }

    public function test_template_preview_is_restricted_to_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        $templates = new TemplatePersistenceService;
        $template = $templates->create($owner, 'Private Header', DefaultTemplateFactory::mainHeaderDocument(), 'private-header', null, 'header');

        $this->get(route('preview.templates.show', $template))->assertRedirect();
        $this->actingAs($other)->get(route('preview.templates.show', $template))->assertForbidden();
    }

    /** @param array<string, mixed> $node */
    private function setFirstTextNode(array &$node, string $value): bool
    {
        if (isset($node['props']['text']) && is_string($node['props']['text'])) {
            $node['props']['text'] = $value;

            return true;
        }

        foreach ($node['children'] ?? [] as $index => $child) {
            if ($this->setFirstTextNode($node['children'][$index], $value)) {
                return true;
            }
        }

        return false;
    }
}

