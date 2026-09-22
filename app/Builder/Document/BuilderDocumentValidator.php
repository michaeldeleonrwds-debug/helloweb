<?php

namespace App\Builder\Document;

use App\Builder\Style\StyleValidator;

final class BuilderDocumentValidator
{
    public function validate(mixed $document): ValidationResult
    {
        $errors = [];

        if (! is_array($document) || ! $this->isObjectArray($document)) {
            return new ValidationResult(['Document must be an object.']);
        }

        if (! array_key_exists('schemaVersion', $document)) {
            $errors[] = 'Document must include schemaVersion.';
        } elseif (! is_int($document['schemaVersion']) || ! BuilderDocumentSchema::supports($document['schemaVersion'])) {
            $errors[] = 'Document schemaVersion is not supported.';
        }

        if (! array_key_exists('root', $document)) {
            $errors[] = 'Document must include root.';
        } elseif (! is_array($document['root']) || ! $this->isObjectArray($document['root'])) {
            $errors[] = 'Document root must be an object.';
        }

        if (array_key_exists('metadata', $document) && (! is_array($document['metadata']) || ! $this->isObjectArray($document['metadata']))) {
            $errors[] = 'Document metadata must be an object when provided.';
        }

        if (isset($document['root']) && is_array($document['root']) && $this->isObjectArray($document['root'])) {
            $seenNodeIds = [];
            $this->validateNode($document['root'], 'root', $seenNodeIds, $errors);
        }

        return new ValidationResult($errors);
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<string, true>  $seenNodeIds
     * @param  list<string>  $errors
     */
    private function validateNode(array $node, string $path, array &$seenNodeIds, array &$errors): void
    {
        if (! array_key_exists('id', $node)) {
            $errors[] = "{$path}.id is required.";
        } elseif (! is_string($node['id']) || trim($node['id']) === '') {
            $errors[] = "{$path}.id must be a non-empty string.";
        } elseif (isset($seenNodeIds[$node['id']])) {
            $errors[] = "{$path}.id must be unique within the document.";
        } else {
            $seenNodeIds[$node['id']] = true;
        }

        if (! array_key_exists('type', $node)) {
            $errors[] = "{$path}.type is required.";
        } elseif (! is_string($node['type']) || ! preg_match('/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/', $node['type'])) {
            $errors[] = "{$path}.type must be a namespaced component type string.";
        }

        if (! array_key_exists('props', $node)) {
            $errors[] = "{$path}.props is required.";
        } elseif (! is_array($node['props']) || ! $this->isObjectArray($node['props'])) {
            $errors[] = "{$path}.props must be an object.";
        }

        if (! array_key_exists('styles', $node)) {
            $errors[] = "{$path}.styles is required.";
        } elseif (! is_array($node['styles']) || ! $this->isObjectArray($node['styles'])) {
            $errors[] = "{$path}.styles must be an object.";
        } else {
            $errors = [...$errors, ...(new StyleValidator)->validate($node['styles'], "{$path}.styles")];
        }

        if (array_key_exists('metadata', $node) && (! is_array($node['metadata']) || ! $this->isObjectArray($node['metadata']))) {
            $errors[] = "{$path}.metadata must be an object when provided.";
        }

        if (! array_key_exists('children', $node)) {
            $errors[] = "{$path}.children is required.";

            return;
        }

        if (! is_array($node['children']) || ! $this->isListArray($node['children'])) {
            $errors[] = "{$path}.children must be an array.";

            return;
        }

        foreach ($node['children'] as $index => $child) {
            if (! is_array($child) || ! $this->isObjectArray($child)) {
                $errors[] = "{$path}.children.{$index} must be an object.";

                continue;
            }

            $this->validateNode($child, "{$path}.children.{$index}", $seenNodeIds, $errors);
        }
    }

    /**
     * @param  array<string, mixed>  $styles
     * @param  list<string>  $errors
     */
    /**
     * @param  array<mixed>  $value
     */
    private function isObjectArray(array $value): bool
    {
        return $value === [] || ! array_is_list($value);
    }

    /**
     * @param  array<mixed>  $value
     */
    private function isListArray(array $value): bool
    {
        return array_is_list($value);
    }
}
