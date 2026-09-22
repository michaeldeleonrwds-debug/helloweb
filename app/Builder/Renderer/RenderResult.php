<?php

namespace App\Builder\Renderer;

final readonly class RenderResult
{
    /**
     * @param  array<string, string>  $attributes
     * @param  array<string, mixed>  $styles
     * @param  list<RenderResult>  $children
     */
    public function __construct(
        private ?string $tag = null,
        private array $attributes = [],
        private array $styles = [],
        private array $children = [],
        private ?string $text = null,
    ) {}

    public static function fragment(array $children): self
    {
        return new self(children: $children);
    }

    public function tag(): ?string
    {
        return $this->tag;
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return $this->attributes;
    }

    /**
     * @return array<string, mixed>
     */
    public function styles(): array
    {
        return $this->styles;
    }

    /**
     * @return list<RenderResult>
     */
    public function children(): array
    {
        return $this->children;
    }

    public function text(): ?string
    {
        return $this->text;
    }

    public function toHtml(): string
    {
        $children = implode('', array_map(
            static fn (RenderResult $child): string => $child->toHtml(),
            $this->children,
        ));
        $text = $this->text === null ? '' : htmlspecialchars($this->text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        if ($this->tag === null) {
            return $text.$children;
        }

        return sprintf(
            '<%s%s>%s%s</%s>',
            $this->tag,
            $this->serializeAttributes(),
            $text,
            $children,
            $this->tag,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'tag' => $this->tag,
            'attributes' => $this->attributes,
            'styles' => $this->styles,
            'text' => $this->text,
            'children' => array_map(
                static fn (RenderResult $child): array => $child->toArray(),
                $this->children,
            ),
        ];
    }

    private function serializeAttributes(): string
    {
        $attributes = $this->attributes;

        if ($this->styles !== []) {
            $attributes['style'] = $this->serializeStyles();
        }

        ksort($attributes);

        $serialized = [];

        foreach ($attributes as $name => $value) {
            $serialized[] = sprintf(
                '%s="%s"',
                htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            );
        }

        return $serialized === [] ? '' : ' '.implode(' ', $serialized);
    }

    private function serializeStyles(): string
    {
        $styles = $this->styles;
        ksort($styles);

        $serialized = [];

        foreach ($styles as $name => $value) {
            if (! is_scalar($value) && ! $this->isStructuredLength($value)) {
                continue;
            }

            $serialized[] = $this->kebabCase($name).': '.$this->serializeStyleValue($value);
        }

        return implode('; ', $serialized);
    }

    private function kebabCase(string $value): string
    {
        return strtolower((string) preg_replace('/(?<!^)[A-Z]/', '-$0', $value));
    }

    private function serializeStyleValue(mixed $value): string
    {
        if ($this->isStructuredLength($value)) {
            return $value['value'].$value['unit'];
        }

        return (string) $value;
    }

    private function isStructuredLength(mixed $value): bool
    {
        return is_array($value)
            && ! array_is_list($value)
            && (is_int($value['value'] ?? null) || is_float($value['value'] ?? null))
            && is_string($value['unit'] ?? null);
    }
}
