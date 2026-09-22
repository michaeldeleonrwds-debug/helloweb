<?php

namespace App\Builder\Persistence;

use Illuminate\Support\Str;

final class DocumentNodeCloner
{
    /** @param array<string, mixed> $node @param array<string, true> $used @return array<string, mixed> */
    public function clone(array $node, array &$used): array
    {
        do {
            $id = 'node-'.Str::lower(Str::random(16));
        } while (isset($used[$id]));

        $used[$id] = true;
        $copy = $node;
        $copy['id'] = $id;
        $copy['children'] = array_map(fn (array $child): array => $this->clone($child, $used), $node['children']);

        return $copy;
    }
}
