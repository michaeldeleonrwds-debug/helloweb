<?php

namespace App\Providers;

use App\Builder\Media\LaravelMediaStorage;
use App\Builder\Media\MediaStorage;
use App\Models\MediaAsset;
use App\Models\Page;
use App\Models\ReusableComponent;
use App\Models\Template;
use App\Policies\MediaAssetPolicy;
use App\Policies\PagePolicy;
use App\Policies\ReusableComponentPolicy;
use App\Policies\TemplatePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(MediaStorage::class, fn ($app): LaravelMediaStorage => new LaravelMediaStorage($app['filesystem']));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Page::class, PagePolicy::class);
        Gate::policy(Template::class, TemplatePolicy::class);
        Gate::policy(MediaAsset::class, MediaAssetPolicy::class);
        Gate::policy(ReusableComponent::class, ReusableComponentPolicy::class);
    }
}
