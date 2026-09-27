<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReusableComponent extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'description', 'is_platform', 'document', 'schema_version', 'status'];

    protected function casts(): array
    {
        return [
            'document' => 'array',
            'schema_version' => 'integer',
            'is_platform' => 'boolean',
        ];
    }

    public function isPlatform(): bool
    {
        return (bool) $this->is_platform;
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
