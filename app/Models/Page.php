<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'website_id',
        'title',
        'slug',
        'status',
        'draft_document',
        'published_document',
        'published_at',
        'document_schema_version',
        'document_version',
        'current_revision_id',
    ];

    protected function casts(): array
    {
        return [
            'draft_document' => 'array',
            'published_document' => 'array',
            'published_at' => 'datetime',
            'document_schema_version' => 'integer',
            'document_version' => 'integer',
        ];
    }

    public function isPublished(): bool
    {
        return $this->status === 'published' && $this->published_document !== null;
    }

    public function hasUnpublishedChanges(): bool
    {
        return $this->status === 'published' && $this->draft_document !== $this->published_document;
    }

    /** @return BelongsTo<Website, $this> */
    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    /** @return HasMany<PageRevision, $this> */
    public function revisions(): HasMany
    {
        return $this->hasMany(PageRevision::class);
    }

    /** @return BelongsTo<PageRevision, $this> */
    public function currentRevision(): BelongsTo
    {
        return $this->belongsTo(PageRevision::class, 'current_revision_id');
    }
}
