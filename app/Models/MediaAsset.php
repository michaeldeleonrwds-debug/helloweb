<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaAsset extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'original_filename', 'storage_disk', 'storage_key', 'mime_type', 'file_size', 'width', 'height', 'alt_text', 'metadata', 'status'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'file_size' => 'integer', 'width' => 'integer', 'height' => 'integer'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
