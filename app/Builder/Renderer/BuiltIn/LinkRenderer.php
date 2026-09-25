<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;
use App\Builder\Renderer\StyleResolver;

final readonly class LinkRenderer implements ComponentRenderer
{
    public function __construct(
        private StyleResolver $styleResolver = new StyleResolver,
    ) {}

    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        $props = array_replace($definition->defaultProps(), $node['props']);
        $text = (string) ($props['text'] ?? '');
        $hasIcon = (! empty($props['icon']) || ! empty($props['customIcon'])) && ($props['showIcon'] ?? true);

        if ($hasIcon) {
            $icon = (string) ($props['customIcon'] ?? $props['icon'] ?? '');
            $iconPos = (string) ($props['iconPosition'] ?? 'left');
            $iconSvg = str_starts_with($icon, '<svg') ? $icon : '<span class="hw-icon" data-icon="'.htmlspecialchars($icon, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8').'"></span>';
            $textSpan = '<span>'.htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8').'</span>';
            $html = $iconPos === 'right' ? $textSpan.$iconSvg : $iconSvg.$textSpan;

            return new RenderResult(
                tag: 'a',
                attributes: NodeAttributes::for($node, ['href' => (string) ($props['href'] ?? '#')]),
                styles: $this->styleResolver->resolve($node, $definition, $context->breakpoint()),
                children: $children,
                html: $html,
            );
        }

        return new RenderResult(
            tag: 'a',
            attributes: NodeAttributes::for($node, ['href' => (string) ($props['href'] ?? '#')]),
            styles: $this->styleResolver->resolve($node, $definition, $context->breakpoint()),
            text: $text,
            children: $children,
        );
    }
}
