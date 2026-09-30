<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiSetting extends Model
{
    protected $fillable = [
        'user_id',
        'ai_provider',
        'ai_api_key',
        'ai_model',
        'ai_enabled',
        'ai_status',
        'ai_tested_at',
        'openai_api_key',
        'openai_model',
        'openai_enabled',
        'openai_status',
        'openai_tested_at',
        'mcp_enabled',
        'mcp_configuration',
    ];

    protected function casts(): array
    {
        return [
            'ai_api_key' => 'encrypted',
            'ai_enabled' => 'boolean',
            'ai_tested_at' => 'datetime',
            'openai_api_key' => 'encrypted',
            'openai_enabled' => 'boolean',
            'openai_tested_at' => 'datetime',
            'mcp_enabled' => 'boolean',
            'mcp_configuration' => 'array',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
