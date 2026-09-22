<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageRevision extends Model
{
    use HasFactory;

    protected $fillable = ['page_id', 'revision_number', 'document', 'schema_version', 'created_by', 'type'];

    protected function casts(): array
    {
        return [
            'document' => 'array',
            'revision_number' => 'integer',
            'schema_version' => 'integer',
        ];
    }

    /** @return BelongsTo<Page, $this> */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
