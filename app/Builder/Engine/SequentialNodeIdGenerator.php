<?php

namespace App\Builder\Engine;

final class SequentialNodeIdGenerator implements NodeIdGenerator
{
    private int $next;

    public function __construct(int $start = 1)
    {
        $this->next = $start;
    }

    /**
     * @param  array<string, true>  $existingIds
     */
    public function generate(string $sourceNodeId, array $existingIds): string
    {
        do {
            $nodeId = "node_{$this->next}";
            $this->next++;
        } while (isset($existingIds[$nodeId]));

        return $nodeId;
    }
}
