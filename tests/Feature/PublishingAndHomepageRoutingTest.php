<?php

namespace Tests\Feature;

use App\Builder\Document\BuilderDocument;
use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Models\Page;
use App\Models\User;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublishingAndHomepageRoutingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Website $website;
    private Page $homePage;
    private BuilderPagePersistenceService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(BuilderPagePersistenceService::class);
        $this->user = User::factory()->create();
        $this->website = $this->service->createWebsite($this->user, 'Main Site', 'main-site');
        $this->homePage = $this->website->homepage;
    }

    public function test_1_selected_home_page_renders_at_root_url_not_laravel_welcome(): void
    {
        // Website has Home page as configured homepage and is published
        $this->assertSame($this->homePage->id, $this->website->homepage_page_id);
        $this->assertTrue($this->homePage->isPublished());

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('public-site')
            ->where('page.title', 'Home')
            ->where('page.slug', 'home')
            ->has('document.root')
        );
    }

    public function test_2_changing_homepage_to_about_dynamically_renders_about_at_root_url(): void
    {
        $aboutPage = $this->service->createPage($this->website, 'About', 'about', published: true);

        $response = $this->actingAs($this->user)->patch(route('website.settings.update'), [
            'name' => 'Main Site',
            'site_title' => 'Main Site Title',
            'homepage_page_id' => $aboutPage->id,
        ]);

        $response->assertRedirect();
        $this->assertSame($aboutPage->id, $this->website->fresh()->homepage_page_id);

        $rootResponse = $this->get('/');
        $rootResponse->assertOk();
        $rootResponse->assertInertia(fn (Assert $page) => $page
            ->component('public-site')
            ->where('page.title', 'About')
            ->where('page.slug', 'about')
        );
    }

    public function test_3_changing_homepage_back_to_home_renders_home_at_root_url(): void
    {
        $aboutPage = $this->service->createPage($this->website, 'About', 'about', published: true);

        // Change to about
        $this->actingAs($this->user)->patch(route('website.settings.update'), [
            'name' => 'Main Site',
            'homepage_page_id' => $aboutPage->id,
        ]);

        // Change back to home
        $this->actingAs($this->user)->patch(route('website.settings.update'), [
            'name' => 'Main Site',
            'homepage_page_id' => $this->homePage->id,
        ]);

        $this->assertSame($this->homePage->id, $this->website->fresh()->homepage_page_id);

        $rootResponse = $this->get('/');
        $rootResponse->assertOk();
        $rootResponse->assertInertia(fn (Assert $page) => $page
            ->component('public-site')
            ->where('page.title', 'Home')
            ->where('page.slug', 'home')
        );
    }

    public function test_4_draft_page_is_not_accessible_via_public_route(): void
    {
        $testPage = $this->service->createPage($this->website, 'Test Page', 'test-page', published: false);

        $this->assertSame('draft', $testPage->status);
        $this->assertNull($testPage->published_document);

        $response = $this->get('/test-page');
        $response->assertNotFound();
    }

    public function test_5_publishing_draft_page_makes_it_publicly_available(): void
    {
        $testPage = $this->service->createPage($this->website, 'Test Page', 'test-page', published: false);

        // Publish via builder endpoint
        $publishResponse = $this->actingAs($this->user)->postJson(route('builder.pages.publish', $testPage), [
            'document' => $testPage->draft_document,
        ]);

        $publishResponse->assertOk();
        $this->assertSame('published', $testPage->fresh()->status);
        $this->assertNotNull($testPage->fresh()->published_document);

        $publicResponse = $this->get('/test-page');
        $publicResponse->assertOk();
        $publicResponse->assertInertia(fn (Assert $page) => $page
            ->component('public-site')
            ->where('page.title', 'Test Page')
            ->where('page.slug', 'test-page')
        );
    }

    public function test_6_saving_draft_on_published_page_does_not_modify_public_version(): void
    {
        $page = $this->service->createPage($this->website, 'Services', 'services', published: true);

        // Verify initial public document has original button text
        $initialDoc = $page->published_document;
        $this->assertNotNull($initialDoc);

        // Modify draft document only
        $modifiedDoc = $initialDoc;
        $modifiedDoc['root']['children'][0]['children'][0]['children'][0]['children'][1]['props']['text'] = 'DRAFT ONLY HEADLINE';

        $saveResponse = $this->actingAs($this->user)->patchJson(route('builder.pages.document.update', $page), [
            'document' => $modifiedDoc,
            'expected_version' => 0,
        ]);
        $saveResponse->assertOk();

        // Draft document has the update
        $this->assertSame('DRAFT ONLY HEADLINE', $page->fresh()->draft_document['root']['children'][0]['children'][0]['children'][0]['children'][1]['props']['text']);
        // Published document retains original
        $this->assertNotSame('DRAFT ONLY HEADLINE', $page->fresh()->published_document['root']['children'][0]['children'][0]['children'][0]['children'][1]['props']['text']);

        // Public route renders published version, NOT draft version
        $publicResponse = $this->get('/services');
        $publicResponse->assertOk();
        $publicResponse->assertInertia(fn (Assert $pageAssertion) => $pageAssertion
            ->component('public-site')
            ->where('page.slug', 'services')
            ->where('document.root.children.0.children.0.children.0.children.1.props.text', fn ($val) => $val !== 'DRAFT ONLY HEADLINE')
        );
    }

    public function test_7_publishing_updated_version_updates_public_content(): void
    {
        $page = $this->service->createPage($this->website, 'Services', 'services', published: true);

        $modifiedDoc = $page->draft_document;
        $modifiedDoc['root']['children'][0]['children'][0]['children'][0]['children'][1]['props']['text'] = 'NEW PUBLISHED HEADLINE';

        // Publish with updated document
        $this->actingAs($this->user)->postJson(route('builder.pages.publish', $page), [
            'document' => $modifiedDoc,
        ])->assertOk();

        // Public route now renders new published version
        $publicResponse = $this->get('/services');
        $publicResponse->assertOk();
        $publicResponse->assertInertia(fn (Assert $pageAssertion) => $pageAssertion
            ->component('public-site')
            ->where('page.slug', 'services')
            ->where('document.root.children.0.children.0.children.0.children.1.props.text', 'NEW PUBLISHED HEADLINE')
        );
    }

    public function test_8_creating_new_website_automatically_creates_and_publishes_default_home_page(): void
    {
        $newWebsite = $this->service->createWebsite($this->user, 'Brand New', 'brand-new');

        $this->assertNotNull($newWebsite->homepage_page_id);
        $this->assertNotNull($newWebsite->homepage);
        $this->assertSame('Home', $newWebsite->homepage->title);
        $this->assertSame('home', $newWebsite->homepage->slug);
        $this->assertSame('published', $newWebsite->homepage->status);
        $this->assertNotNull($newWebsite->homepage->published_document);
    }

    public function test_9_selected_homepage_remains_selected_on_settings_page_refresh(): void
    {
        $contactPage = $this->service->createPage($this->website, 'Contact', 'contact', published: true);

        // Select Contact as homepage
        $this->actingAs($this->user)->patch(route('website.settings.update'), [
            'name' => 'Main Site',
            'homepage_page_id' => $contactPage->id,
        ])->assertRedirect();

        // Refresh settings page
        $settingsResponse = $this->actingAs($this->user)->get(route('website.settings.edit'));
        $settingsResponse->assertOk();
        $settingsResponse->assertInertia(fn (Assert $page) => $page
            ->component('settings/website')
            ->where('website.homepageId', $contactPage->id)
        );
    }
}
