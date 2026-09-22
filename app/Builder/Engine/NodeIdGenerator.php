<?php

namespace App\Builder\Engine;

interface NodeIdGenerator
{
    /**
     * @param  array<string, true>  $existingIds
     */
    public function generate(string $sourceNodeId, array $existingIds): string;
}
