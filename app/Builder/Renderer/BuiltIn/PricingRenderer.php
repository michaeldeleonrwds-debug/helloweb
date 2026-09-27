<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;
use App\Builder\Renderer\StyleResolver;

final readonly class PricingRenderer implements ComponentRenderer
{
    public function __construct(
        private StyleResolver $styleResolver = new StyleResolver,
    ) {}

    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        $props = array_replace($definition->defaultProps(), is_array($node['props'] ?? null) ? $node['props'] : []);
        $styles = $this->styleResolver->resolve($node, $definition, $context->breakpoint());

        $badge = ($props['showBadge'] ?? true) !== false ? trim((string) ($props['badge'] ?? '')) : '';
        $planName = trim((string) ($props['planName'] ?? 'Pro'));
        $description = trim((string) ($props['description'] ?? ''));
        $price = trim((string) ($props['price'] ?? '$49'));
        $period = trim((string) ($props['period'] ?? '/ month'));
        $ctaText = trim((string) ($props['ctaText'] ?? ''));
        $ctaHref = (string) ($props['ctaHref'] ?? '#');
        $accentColor = (string) ($props['accentColor'] ?? '#2563eb');
        $highlighted = ($props['highlighted'] ?? true) !== false;
        $priceSize = $context->breakpoint() === 'mobile' ? '2rem' : '2.5rem';

        $features = array_values(array_filter(array_map(
            static fn (string $feature): string => trim($feature),
            preg_split('/\R/', (string) ($props['featureText'] ?? '')) ?: [],
        )));

        $featureHtml = implode('', array_map(
            fn (string $feature): string => '<li style="display: flex; align-items: flex-start; gap: 10px; min-width: 0; color: inherit;">'
                .'<span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; flex: 0 0 18px; margin-top: 2px; border-radius: 9999px; background: '.$this->escape($accentColor).'1f; color: '.$this->escape($accentColor).';">'
                .'<svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
                .'</span>'
                .'<span style="flex: 1; min-width: 0; overflow-wrap: anywhere;">'.$this->escape($feature).'</span>'
                .'</li>',
            $features,
        ));

        $html = '<div class="hw-pricing-card-inner" style="display: flex; min-width: 0; width: 100%; flex-direction: column; gap: 18px;">'
            .'<div style="display: flex; min-width: 0; flex-direction: column; gap: 10px;">'
            .($badge !== '' ? '<span style="display: inline-flex; width: fit-content; max-width: 100%; align-items: center; border-radius: 9999px; background: '.$this->escape($accentColor).'17; color: '.$this->escape($accentColor).'; padding: 5px 10px; font-size: 0.6875rem; font-weight: 700; line-height: 1.2; text-transform: uppercase; overflow-wrap: anywhere;">'.$this->escape($badge).'</span>' : '')
            .'<h3 style="margin: 0; color: inherit; font-size: 1.25rem; font-weight: 700; line-height: 1.25; overflow-wrap: anywhere;">'.$this->escape($planName).'</h3>'
            .($description !== '' ? '<p style="margin: 0; color: inherit; font-size: 0.875rem; line-height: 1.6; opacity: 0.76; overflow-wrap: anywhere;">'.$this->escape($description).'</p>' : '')
            .'</div>'
            .'<div style="display: flex; min-width: 0; align-items: baseline; gap: 8px; flex-wrap: wrap; padding-top: 2px;">'
            .'<span style="color: inherit; font-size: '.$priceSize.'; font-weight: 800; line-height: 1; overflow-wrap: anywhere;">'.$this->escape($price).'</span>'
            .($period !== '' ? '<span style="color: inherit; font-size: 0.875rem; line-height: 1.4; opacity: 0.68; overflow-wrap: anywhere;">'.$this->escape($period).'</span>' : '')
            .'</div>'
            .($featureHtml !== '' ? '<ul style="display: flex; flex-direction: column; gap: 11px; margin: 0; padding: 0; list-style: none; font-size: 0.875rem; line-height: 1.5;">'.$featureHtml.'</ul>' : '')
            .($ctaText !== '' ? '<a href="'.$this->escape($ctaHref).'" style="display: inline-flex; min-height: 44px; width: 100%; align-items: center; justify-content: center; border-radius: 12px; background: '.$this->escape($accentColor).'; color: #ffffff; padding: 11px 16px; text-align: center; text-decoration: none; font-size: 0.875rem; font-weight: 700; line-height: 1.2; box-shadow: '.($highlighted ? '0 12px 24px rgba(37, 99, 235, 0.22)' : 'none').'; overflow-wrap: anywhere;">'.$this->escape($ctaText).'</a>' : '')
            .'</div>';

        return new RenderResult(
            tag: 'article',
            attributes: NodeAttributes::for($node),
            styles: $styles,
            children: [],
            html: $html,
        );
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
