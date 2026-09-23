<?php

namespace Tests\Feature;

use App\Builder\Persistence\BuilderPagePersistenceService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sections_resolve_to_independent_inertia_pages(): void
    {
        $user = User::factory()->create();

        $pages = [
            'dashboard' => 'dashboard',
            'websites.index' => 'websites/index',
            'pages.index' => 'pages/index',
            'templates.index' => 'templates/index',
            'media.index' => 'media/index',
            'reusable-components.index' => 'reusable-components/index',
        ];

        foreach ($pages as $route => $component) {
            $this->actingAs($user)->get(route($route))->assertOk()->assertInertia(fn ($assertion) => $assertion->component($component));
        }
    }

    public function test_admin_sections_require_authentication(): void
    {
        foreach (['websites.index', 'pages.index', 'templates.index', 'media.index', 'reusable-components.index'] as $route) {
            $this->get(route($route))->assertRedirect('/login');
        }
    }

    public function test_builder_opens_the_selected_page_document(): void
    {
        $user = User::factory()->create();
        $service = app(BuilderPagePersistenceService::class);
        $website = $service->createWebsite($user, 'My Website', 'my-website');
        $home = $service->createPage($website, 'Home', 'home');
        $about = $service->createPage($website, 'About', 'about');

        $this->actingAs($user)->get(route('builder.pages.show', $home))->assertInertia(fn ($assertion) => $assertion
            ->component('builder')
            ->where('page.id', $home->id));
        $this->actingAs($user)->get(route('builder.pages.show', $about))->assertInertia(fn ($assertion) => $assertion
            ->component('builder')
            ->where('page.id', $about->id));
    }
}
