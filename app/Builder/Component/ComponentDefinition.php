<?php

namespace App\Builder\Component;

use InvalidArgumentException;

final readonly class ComponentDefinition
{
    /**
     * @param  array<string, bool>  $capabilities
     * @param  array<string, mixed>  $defaultProps
     * @param  array<string, mixed>  $defaultStyles
     * @param  array<string, mixed>  $propSchema
     * @param  array<string, mixed>  $childRules
     * @param  array<string, mixed>  $integration
     */
    public function __construct(
        private string $type,
        private string $name,
        private string $category,
        private ?string $description = null,
        private array $capabilities = [],
        private array $defaultProps = [],
        private array $defaultStyles = [],
        private array $propSchema = [],
        private array $childRules = [],
        private array $integration = [],
    ) {
        $this->assertValid();
    }

    public function type(): string
    {
        return $this->type;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function category(): string
    {
        return $this->category;
    }

    public function description(): ?string
    {
        return $this->description;
    }

    /**
     * @return array<string, bool>
     */
    public function capabilities(): array
    {
        return $this->capabilities;
    }

    public function supports(string $capability): bool
    {
        return $this->capabilities[$capability] ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function defaultProps(): array
    {
        return $this->defaultProps;
    }

    /**
     * @return array<string, mixed>
     */
    public function defaultStyles(): array
    {
        return $this->defaultStyles;
    }

    /**
     * @return array<string, mixed>
     */
    public function propSchema(): array
    {
        return $this->propSchema;
    }

    /**
     * @return array<string, mixed>
     */
    public function childRules(): array
    {
        return $this->childRules;
    }

    /**
     * @return array<string, mixed>
     */
    public function integration(): array
    {
        return $this->integration;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'capabilities' => $this->capabilities,
            'defaultProps' => $this->defaultProps,
            'defaultStyles' => $this->defaultStyles,
            'propSchema' => $this->propSchema,
            'childRules' => $this->childRules,
            'integration' => $this->integration,
        ];
    }

    private function assertValid(): void
    {
        if (! preg_match('/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/', $this->type)) {
            throw new InvalidArgumentException('Component type must be a namespaced type string.');
        }

        if (trim($this->name) === '') {
            throw new InvalidArgumentException('Component name must be a non-empty string.');
        }

        if (trim($this->category) === '') {
            throw new InvalidArgumentException('Component category must be a non-empty string.');
        }

        foreach ($this->capabilities as $capability => $enabled) {
            if (! is_string($capability) || trim($capability) === '' || ! is_bool($enabled)) {
                throw new InvalidArgumentException('Component capabilities must be keyed booleans.');
            }
        }

        if (! $this->isObjectArray($this->defaultProps)) {
            throw new InvalidArgumentException('Component default props must be an object array.');
        }

        if (! $this->isObjectArray($this->defaultStyles)) {
            throw new InvalidArgumentException('Component default styles must be an object array.');
        }

        if (! $this->isObjectArray($this->propSchema)) {
            throw new InvalidArgumentException('Component prop schema must be an object array.');
        }

        if (! $this->isObjectArray($this->childRules)) {
            throw new InvalidArgumentException('Component child rules must be an object array.');
        }

        if (! $this->isObjectArray($this->integration)) {
            throw new InvalidArgumentException('Component integration metadata must be an object array.');
        }
    }

    /**
     * @param  array<mixed>  $value
     */
    private function isObjectArray(array $value): bool
    {
        return $value === [] || ! array_is_list($value);
    }
}
