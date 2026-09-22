<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReusableComponent extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'description', 'document', 'schema_version', 'status'];

    protected function casts(): array
    {
        return ['document' => 'array', 'schema_version' => 'integer'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
