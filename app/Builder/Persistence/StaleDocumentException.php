<?php

namespace App\Builder\Persistence;

use RuntimeException;

final class StaleDocumentException extends RuntimeException
{
    public function __construct(
        public readonly int $expectedVersion,
        public readonly int $currentVersion,
    ) {
        parent::__construct("Document version {$expectedVersion} is stale; current version is {$currentVersion}.");
    }
}
