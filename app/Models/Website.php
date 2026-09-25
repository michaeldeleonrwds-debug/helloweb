<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Website extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'site_title', 'tagline', 'favicon_url', 'slug', 'status', 'homepage_page_id'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Page, $this> */
    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    /** @return BelongsTo<Page, $this> */
    public function homepage(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'homepage_page_id');
    }

    public static function current(): ?static
    {
        return static::query()->with('homepage')->orderBy('id')->first();
    }
}
