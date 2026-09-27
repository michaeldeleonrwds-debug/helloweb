<?php

namespace App\Builder\Renderer\BuiltIn;

use App\Builder\Component\ComponentDefinition;
use App\Builder\Renderer\ComponentRenderer;
use App\Builder\Renderer\RenderContext;
use App\Builder\Renderer\RenderResult;
use App\Builder\Renderer\StyleResolver;

final readonly class EssentialElementRenderer implements ComponentRenderer
{
    public function __construct(private StyleResolver $styleResolver = new StyleResolver) {}

    public function render(array $node, ComponentDefinition $definition, RenderContext $context, array $children): RenderResult
    {
        $props = array_replace($definition->defaultProps(), is_array($node['props'] ?? null) ? $node['props'] : []);
        $html = match ($node['type']) {
            'media.carousel' => $this->carousel($props, $context),
            'marketing.logomarquee' => $this->logoMarquee($node, $props, $context),
            'content.accordion' => $this->accordion($props),
            'content.tabs' => $this->tabs($props, $context),
            'marketing.stats' => $this->stats($props, $context),
            'marketing.testimonial' => $this->testimonial($props, $context),
            'embed.video' => $this->video($props),
            'form.contact' => $this->contactForm($props, $context),
            'marketing.countdown' => $this->countdown($node, $props, $context),
            'content.socialicons' => $this->socialIcons($props, $context),
            'content.alert' => $this->alert($props),
            'marketing.progressbar' => $this->progressBar($props),
            default => '',
        };

        return new RenderResult(
            tag: 'div',
            attributes: NodeAttributes::for($node),
            styles: $this->styleResolver->resolve($node, $definition, $context->breakpoint()),
            children: [],
            html: $html,
        );
    }

    private function carousel(array $props, RenderContext $context): string
    {
        $slides = $this->objects($props['slides'] ?? []);
        $aspectRatio = $this->e((string) ($props['aspectRatio'] ?? '16/9'));
        $accentColor = $this->e((string) ($props['accentColor'] ?? '#2563eb'));
        $captionPadding = $context->breakpoint() === 'mobile' ? '28px 16px 14px' : '48px 24px 18px';
        $html = '<div style="display: flex; width: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: thin;">';
        foreach ($slides as $slide) {
            $src = (string) ($slide['src'] ?? '');
            $title = (string) ($slide['title'] ?? '');
            $caption = (string) ($slide['caption'] ?? '');
            $html .= '<figure style="position: relative; flex: 0 0 100%; min-width: 0; aspect-ratio: '.$aspectRatio.'; scroll-snap-align: start; margin: 0; background: #e2e8f0;">'
                .($src !== '' ? '<img src="'.$this->e($src).'" alt="'.$this->e($title ?: $caption).'" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;" />' : '')
                .(($title !== '' || $caption !== '') ? '<figcaption style="position: absolute; inset-inline: 0; bottom: 0; padding: '.$captionPadding.'; background: linear-gradient(transparent, rgba(2, 6, 23, 0.76)); color: #ffffff;">'
                    .($title !== '' ? '<strong style="display: block; font-size: 1rem; line-height: 1.25; overflow-wrap: anywhere;">'.$this->e($title).'</strong>' : '')
                    .($caption !== '' ? '<span style="display: block; margin-top: 4px; font-size: 0.8125rem; line-height: 1.45; opacity: 0.86; overflow-wrap: anywhere;">'.$this->e($caption).'</span>' : '')
                    .'</figcaption>' : '')
                .'</figure>';
        }
        $html .= '</div><div aria-hidden="true" style="display: flex; justify-content: center; gap: 6px; padding: 10px;">';
        foreach (array_keys($slides) as $index) {
            $html .= '<span style="width: 7px; height: 7px; border-radius: 9999px; background: '.($index === 0 ? $accentColor : '#cbd5e1').';"></span>';
        }

        return $html.'</div>';
    }

    private function logoMarquee(array $node, array $props, RenderContext $context): string
    {
        $logos = $this->logoImages($props['logos'] ?? null, $props['logoImages'] ?? null);
        $className = 'hw-logo-marquee-'.preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $node['id']);
        $direction = ($props['direction'] ?? 'left') === 'right' ? 'reverse' : 'normal';
        $gap = (string) ($props['gap'] ?? ($context->breakpoint() === 'mobile' ? '16px' : '24px'));
        $speed = (string) ($props['speed'] ?? '25s');
        $pauseOnHover = ($props['pauseOnHover'] ?? true) !== false;
        $fadeEdges = ($props['fadeEdges'] ?? true) !== false;
        $fadeWidth = (string) ($props['fadeWidth'] ?? '80px');
        $grayscale = ($props['grayscale'] ?? true) !== false;
        $cardStyle = (string) ($props['logoCardStyle'] ?? 'card') === 'card';
        $logoHeight = (string) ($props['logoHeight'] ?? '36px');
        $cardBg = (string) ($props['logoBackground'] ?? '#ffffff');
        $borderColor = (string) ($props['borderColor'] ?? '#e2e8f0');

        $logoGroup = '';
        foreach ($logos as $logo) {
            $src = $this->e($logo['src']);
            $alt = $this->e($logo['alt'] ?? 'Logo');
            $href = (string) ($logo['href'] ?? '');

            $cardPadding = $cardStyle ? '10px 20px' : '6px 12px';
            $cardBorder = $cardStyle ? '1px solid '.$this->e($borderColor) : 'none';
            $cardBackground = $cardStyle ? $this->e($cardBg) : 'transparent';
            $cardRadius = $cardStyle ? '12px' : '0px';
            $cardShadow = $cardStyle ? '0 2px 6px rgba(0,0,0,0.04)' : 'none';

            $itemInner = '<span class="hw-marquee-logo-badge" style="display: inline-flex; flex: 0 0 auto; min-width: max-content; align-items: center; justify-content: center; border: '.$cardBorder.'; border-radius: '.$cardRadius.'; background: '.$cardBackground.'; box-shadow: '.$cardShadow.'; padding: '.$cardPadding.'; transition: all 0.25s ease;"><img src="'.$src.'" alt="'.$alt.'" loading="lazy" style="display: block; width: auto; height: '.$this->e($logoHeight).'; max-width: 180px; object-fit: contain; '.($grayscale ? 'filter: grayscale(100%) opacity(0.7); transition: filter 0.25s ease, opacity 0.25s ease;' : '').'" /></span>';

            if ($href !== '') {
                $logoGroup .= '<a href="'.$this->e($href).'" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: inline-flex;">'.$itemInner.'</a>';
            } else {
                $logoGroup .= $itemInner;
            }
        }

        $maskStyle = $fadeEdges ? 'mask-image: linear-gradient(90deg, transparent 0%, #000 '.$this->e($fadeWidth).', #000 calc(100% - '.$this->e($fadeWidth).'), transparent 100%); -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 '.$this->e($fadeWidth).', #000 calc(100% - '.$this->e($fadeWidth).'), transparent 100%);' : '';

        return '<div class="'.$className.'" style="display: flex; overflow: hidden; width: 100%; position: relative; '.$maskStyle.'"><div class="hw-marquee-track" style="display: flex; width: max-content; min-width: max-content; animation: '.$className.'-scroll '.$this->e($speed).' linear infinite; animation-direction: '.$direction.'; will-change: transform;"><div style="display: flex; flex: 0 0 auto; gap: '.$this->e($gap).'; padding-right: '.$this->e($gap).';">'.$logoGroup.'</div><div aria-hidden="true" style="display: flex; flex: 0 0 auto; gap: '.$this->e($gap).'; padding-right: '.$this->e($gap).';">'.$logoGroup.'</div><div aria-hidden="true" style="display: flex; flex: 0 0 auto; gap: '.$this->e($gap).'; padding-right: '.$this->e($gap).';">'.$logoGroup.'</div></div></div><style>@keyframes '.$className.'-scroll { from { transform: translateX(0); } to { transform: translateX(-33.333333%); } }'.($pauseOnHover ? ' .'.$className.' .hw-marquee-track:hover { animation-play-state: paused !important; }' : '').($grayscale ? ' .'.$className.' .hw-marquee-logo-badge:hover img { filter: grayscale(0%) opacity(1) !important; }' : '').'</style>';
    }

    private function accordion(array $props): string
    {
        $html = '';
        foreach ($this->objects($props['items'] ?? []) as $index => $item) {
            $html .= '<details '.($index === 0 ? 'open' : '').' style="border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; overflow: hidden;">'
                .'<summary style="cursor: pointer; padding: 16px 18px; color: inherit; font-weight: 700; line-height: 1.3; overflow-wrap: anywhere;">'.$this->e((string) ($item['title'] ?? 'Item '.($index + 1))).'</summary>'
                .'<div style="border-top: 1px solid #e2e8f0; padding: 0 18px 16px; color: inherit; font-size: 0.875rem; line-height: 1.6; opacity: 0.78; overflow-wrap: anywhere; box-shadow: inset 3px 0 0 '.$this->e((string) ($props['accentColor'] ?? '#2563eb')).';">'.$this->e((string) ($item['body'] ?? '')).'</div>'
                .'</details>';
        }

        return $html;
    }

    private function tabs(array $props, RenderContext $context): string
    {
        $tabs = $this->objects($props['tabs'] ?? []);
        $accent = $this->e((string) ($props['accentColor'] ?? '#2563eb'));
        $html = '<div style="display: grid; gap: 12px;"><div role="tablist" style="display: flex; gap: 8px; flex-wrap: wrap;">';
        foreach ($tabs as $index => $tab) {
            $html .= '<span role="tab" aria-selected="'.($index === 0 ? 'true' : 'false').'" style="display: inline-flex; align-items: center; border-radius: 9999px; border: 1px solid '.($index === 0 ? $accent : '#e2e8f0').'; background: '.($index === 0 ? $accent : '#ffffff').'; color: '.($index === 0 ? '#ffffff' : 'inherit').'; padding: 9px 14px; font-size: 0.8125rem; font-weight: 700; line-height: 1;">'.$this->e((string) ($tab['label'] ?? 'Tab '.($index + 1))).'</span>';
        }

        return $html.'</div><div style="border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff; padding: '.($context->breakpoint() === 'mobile' ? '18px' : '22px').'; color: inherit; font-size: 0.9375rem; line-height: 1.65; overflow-wrap: anywhere;">'.$this->e((string) ($tabs[0]['body'] ?? '')).'</div></div>';
    }

    private function stats(array $props, RenderContext $context): string
    {
        $columns = $context->breakpoint() === 'mobile' ? (int) ($props['columnsMobile'] ?? 1) : ($context->breakpoint() === 'tablet' ? (int) ($props['columnsTablet'] ?? 3) : (int) ($props['columnsDesktop'] ?? 3));
        $html = '<div style="display: grid; grid-template-columns: repeat('.max(1, $columns).', minmax(0, 1fr)); gap: 14px; width: 100%;">';
        foreach ($this->objects($props['stats'] ?? []) as $stat) {
            $html .= '<div style="min-width: 0; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff; padding: 20px; text-align: center;"><div style="color: '.$this->e((string) ($props['accentColor'] ?? '#2563eb')).'; font-size: '.($context->breakpoint() === 'mobile' ? '1.8rem' : '2.2rem').'; font-weight: 800; line-height: 1; overflow-wrap: anywhere;">'.$this->e((string) ($stat['value'] ?? '')).'</div><div style="margin-top: 8px; color: inherit; font-size: 0.8125rem; line-height: 1.4; opacity: 0.72; overflow-wrap: anywhere;">'.$this->e((string) ($stat['label'] ?? '')).'</div></div>';
        }

        return $html.'</div>';
    }

    private function testimonial(array $props, RenderContext $context): string
    {
        return '<figure style="display: flex; flex-direction: column; gap: 18px; margin: 0; min-width: 0;"><blockquote style="margin: 0; border-left: 4px solid '.$this->e((string) ($props['accentColor'] ?? '#2563eb')).'; padding-left: 16px; color: inherit; font-size: '.($context->breakpoint() === 'mobile' ? '1rem' : '1.125rem').'; font-weight: 600; line-height: 1.55; overflow-wrap: anywhere;">'.$this->e((string) ($props['quote'] ?? '')).'</blockquote><figcaption style="display: flex; flex-direction: column; gap: 3px; color: inherit;"><strong style="font-size: 0.9375rem; line-height: 1.3; overflow-wrap: anywhere;">'.$this->e((string) ($props['author'] ?? '')).'</strong><span style="font-size: 0.8125rem; line-height: 1.4; opacity: 0.68; overflow-wrap: anywhere;">'.$this->e((string) ($props['role'] ?? '')).'</span></figcaption></figure>';
    }

    private function video(array $props): string
    {
        $src = (string) ($props['src'] ?? '');
        $normalized = $this->normalizeVideoEmbedUrl($src);
        $ratio = $this->e((string) ($props['aspectRatio'] ?? '16/9'));

        return $normalized !== ''
            ? '<iframe src="'.$this->e($normalized).'" title="'.$this->e((string) ($props['title'] ?? 'Embedded video')).'" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="display: block; width: 100%; aspect-ratio: '.$ratio.'; height: auto; border: 0;"></iframe>'
            : '<div style="display: flex; align-items: center; justify-content: center; width: 100%; aspect-ratio: '.$ratio.'; color: #94a3b8; font-size: 0.875rem;">No video URL</div>';
    }

    private function countdown(array $node, array $props, RenderContext $context): string
    {
        $targetDate = (string) ($props['targetDate'] ?? '2026-12-31T23:59:59');
        $styleVariant = (string) ($props['styleVariant'] ?? 'card');
        $showDays = ($props['showDays'] ?? true) !== false;
        $showHours = ($props['showHours'] ?? true) !== false;
        $showMinutes = ($props['showMinutes'] ?? true) !== false;
        $showSeconds = ($props['showSeconds'] ?? true) !== false;
        $labelDays = (string) ($props['labelDays'] ?? 'Days');
        $labelHours = (string) ($props['labelHours'] ?? 'Hours');
        $labelMinutes = (string) ($props['labelMinutes'] ?? 'Minutes');
        $labelSeconds = (string) ($props['labelSeconds'] ?? 'Seconds');
        $digitColor = (string) ($props['digitColor'] ?? '#0f172a');
        $labelColor = (string) ($props['labelColor'] ?? '#64748b');
        $cardBg = (string) ($props['cardBackground'] ?? '#ffffff');
        $cardBorder = (string) ($props['cardBorderColor'] ?? '#e2e8f0');
        $accentColor = (string) ($props['accentColor'] ?? '#2563eb');
        $expiryText = (string) ($props['expiryText'] ?? 'Special offer has ended!');
        $className = 'hw-countdown-'.preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $node['id']);

        $isMobile = $context->breakpoint() === 'mobile';
        $cardRadius = $styleVariant === 'circle' ? '9999px' : ($styleVariant === 'minimal' ? '0' : '16px');
        $cardBorderString = $styleVariant === 'card' ? '1px solid '.$this->e($cardBorder) : 'none';
        $cardShadow = $styleVariant === 'card' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none';
        $cardBgString = $styleVariant === 'minimal' ? 'transparent' : $cardBg;
        $blockSize = $styleVariant === 'circle' ? ($isMobile ? '70px' : '90px') : 'auto';

        $blockItem = fn (string $id, string $val, string $label): string =>
            '<div class="hw-countdown-block" style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1 1 0; min-width: '.($isMobile ? '60px' : '80px').'; width: '.$blockSize.'; height: '.$blockSize.'; padding: '.($isMobile ? '10px 6px' : '16px 12px').'; background: '.$this->e($cardBgString).'; border: '.$cardBorderString.'; border-radius: '.$cardRadius.'; box-shadow: '.$cardShadow.'; text-align: center;">'
            .'<span class="hw-countdown-digit '.$id.'" style="font-family: inherit; font-size: '.($isMobile ? '1.5rem' : '2.25rem').'; font-weight: 800; line-height: 1; color: '.$this->e($digitColor).';">'.$this->e($val).'</span>'
            .'<span style="margin-top: 6px; font-size: '.($isMobile ? '9px' : '11px').'; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: '.$this->e($labelColor).';">'.$this->e($label).'</span>'
            .'</div>';

        $html = '<div class="'.$className.' hw-countdown-container" style="display: flex; align-items: center; justify-content: center; gap: '.($isMobile ? '8px' : '16px').'; width: 100%;" data-target="'.$this->e($targetDate).'">'
            .($showDays ? $blockItem('hw-cd-days', '00', $labelDays) : '')
            .($showHours ? $blockItem('hw-cd-hours', '00', $labelHours) : '')
            .($showMinutes ? $blockItem('hw-cd-minutes', '00', $labelMinutes) : '')
            .($showSeconds ? $blockItem('hw-cd-seconds', '00', $labelSeconds) : '')
            .'</div>'
            .'<div class="'.$className.'-expired" style="display: none; text-align: center; padding: 20px; font-weight: 700; color: '.$this->e($accentColor).';">'.$this->e($expiryText).'</div>'
            .'<script>(function(){var c=document.querySelector(".'.$className.'");if(!c)return;var t=new Date(c.getAttribute("data-target")).getTime();if(isNaN(t))return;function u(){var diff=t-Date.now();if(diff<=0){c.style.display="none";var exp=document.querySelector(".'.$className.'-expired");if(exp)exp.style.display="block";return;}var d=Math.floor(diff/86400000),h=Math.floor((diff/3600000)%24),m=Math.floor((diff/60000)%60),s=Math.floor((diff/1000)%60);function p(n){return(n<10?"0":"")+n;}var elD=c.querySelector(".hw-cd-days");if(elD)elD.textContent=p(d);var elH=c.querySelector(".hw-cd-hours");if(elH)elH.textContent=p(h);var elM=c.querySelector(".hw-cd-minutes");if(elM)elM.textContent=p(m);var elS=c.querySelector(".hw-cd-seconds");if(elS)elS.textContent=p(s);}u();setInterval(u,1000);})();</script>';

        return $html;
    }

    private function socialIcons(array $props, RenderContext $context): string
    {
        $items = $this->objects($props['items'] ?? []);
        $iconStyle = (string) ($props['iconStyle'] ?? 'brand');
        $shape = (string) ($props['shape'] ?? 'circle');
        $size = (string) ($props['size'] ?? 'md');
        $align = (string) ($props['align'] ?? 'center');
        $gap = (string) ($props['gap'] ?? '12px');
        $customColor = (string) ($props['customColor'] ?? '#2563eb');
        $customBg = (string) ($props['customBg'] ?? '#eff6ff');
        $openInNewTab = ($props['openInNewTab'] ?? true) !== false;

        $justify = match ($align) {
            'left' => 'flex-start',
            'right' => 'flex-end',
            default => 'center',
        };

        $radius = match ($shape) {
            'circle' => '9999px',
            'rounded' => '10px',
            default => '2px',
        };

        $boxDim = match ($size) {
            'sm' => '32px',
            'lg' => '48px',
            default => '40px',
        };

        $svgDim = match ($size) {
            'sm' => '16',
            'lg' => '24',
            default => '20',
        };

        $brandColors = [
            'facebook' => ['bg' => '#1877F2', 'color' => '#ffffff'],
            'twitter' => ['bg' => '#000000', 'color' => '#ffffff'],
            'instagram' => ['bg' => '#E4405F', 'color' => '#ffffff'],
            'linkedin' => ['bg' => '#0A66C2', 'color' => '#ffffff'],
            'youtube' => ['bg' => '#FF0000', 'color' => '#ffffff'],
            'github' => ['bg' => '#24292F', 'color' => '#ffffff'],
            'tiktok' => ['bg' => '#000000', 'color' => '#ffffff'],
            'whatsapp' => ['bg' => '#25D366', 'color' => '#ffffff'],
        ];

        $html = '<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: '.$justify.'; gap: '.$this->e($gap).'; width: 100%;">';
        foreach ($items as $item) {
            $platform = strtolower((string) ($item['platform'] ?? 'facebook'));
            $url = (string) ($item['url'] ?? '#');
            $label = (string) ($item['label'] ?? ucfirst($platform));

            $brand = $brandColors[$platform] ?? ['bg' => '#0f172a', 'color' => '#ffffff'];
            $btnBg = $iconStyle === 'brand' ? $brand['bg'] : ($iconStyle === 'outline' ? 'transparent' : $customBg);
            $btnColor = $iconStyle === 'brand' ? $brand['color'] : $customColor;
            $btnBorder = $iconStyle === 'outline' ? '1.5px solid '.$customColor : 'none';

            $targetAttr = $openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
            $svg = $this->socialSvg($platform, $svgDim);

            $html .= '<a href="'.$this->e($url).'" aria-label="'.$this->e($label).'"'.$targetAttr.' style="display: inline-flex; align-items: center; justify-content: center; width: '.$boxDim.'; height: '.$boxDim.'; border-radius: '.$radius.'; background: '.$this->e($btnBg).'; color: '.$this->e($btnColor).'; border: '.$btnBorder.'; text-decoration: none; transition: transform 0.15s, opacity 0.15s; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">'.$svg.'</a>';
        }
        $html .= '</div>';

        return $html;
    }

    private function alert(array $props): string
    {
        $variant = (string) ($props['variant'] ?? 'info');
        $title = (string) ($props['title'] ?? '');
        $message = (string) ($props['message'] ?? '');
        $showIcon = ($props['showIcon'] ?? true) !== false;
        $actionText = (string) ($props['actionText'] ?? '');
        $actionHref = (string) ($props['actionHref'] ?? '#');
        $dismissible = ($props['dismissible'] ?? false) === true;

        $styles = match ($variant) {
            'success' => ['bg' => '#f0fdf4', 'border' => '#bbf7d0', 'color' => '#166534', 'accent' => '#22c55e'],
            'warning' => ['bg' => '#fffbeb', 'border' => '#fde68a', 'color' => '#92400e', 'accent' => '#f59e0b'],
            'destructive' => ['bg' => '#fef2f2', 'border' => '#fecaca', 'color' => '#991b1b', 'accent' => '#ef4444'],
            'neutral' => ['bg' => '#f8fafc', 'border' => '#e2e8f0', 'color' => '#334155', 'accent' => '#64748b'],
            default => ['bg' => '#eff6ff', 'border' => '#bfdbfe', 'color' => '#1e40af', 'accent' => '#3b82f6'],
        };

        $iconSvg = $showIcon ? '<svg style="width: 20px; height: 20px; flex-shrink: 0; color: '.$styles['accent'].';" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' : '';

        $dismissBtn = $dismissible ? '<button type="button" onclick="this.closest(\'.hw-alert-banner\').style.display=\'none\';" style="background: none; border: 0; cursor: pointer; color: inherit; opacity: 0.6; padding: 4px; font-size: 16px; line-height: 1; margin-left: auto;">✕</button>' : '';

        $actionBtn = $actionText !== '' ? '<a href="'.$this->e($actionHref).'" style="display: inline-flex; align-items: center; font-size: 0.8125rem; font-weight: 700; color: inherit; text-decoration: underline; margin-top: 6px;">'.$this->e($actionText).'</a>' : '';

        return '<div class="hw-alert-banner" style="display: flex; align-items: flex-start; gap: 12px; border: 1px solid '.$styles['border'].'; border-radius: 12px; background: '.$styles['bg'].'; color: '.$styles['color'].'; padding: 14px 18px; width: 100%; box-sizing: border-box;">'
            .$iconSvg
            .'<div style="flex: 1 1 0; min-width: 0;">'
            .($title !== '' ? '<strong style="display: block; font-size: 0.875rem; font-weight: 700; line-height: 1.35; margin-bottom: 3px;">'.$this->e($title).'</strong>' : '')
            .($message !== '' ? '<div style="font-size: 0.8125rem; line-height: 1.5; opacity: 0.9;">'.$this->e($message).'</div>' : '')
            .$actionBtn
            .'</div>'
            .$dismissBtn
            .'</div>';
    }

    private function progressBar(array $props): string
    {
        $percentage = max(0, min(100, (int) ($props['percentage'] ?? 50)));
        $label = (string) ($props['label'] ?? '');
        $showPercentage = ($props['showPercentage'] ?? true) !== false;
        $barHeight = (string) ($props['barHeight'] ?? '12px');
        $barColor = (string) ($props['barColor'] ?? '#2563eb');
        $trackColor = (string) ($props['trackColor'] ?? '#e2e8f0');
        $borderRadius = (string) ($props['borderRadius'] ?? '9999px');
        $striped = ($props['striped'] ?? false) === true;
        $animated = ($props['animated'] ?? false) === true;

        $stripeBg = $striped
            ? 'background-image: linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent); background-size: 1rem 1rem;'
            : '';

        $animClass = $animated ? 'hw-progress-animated' : '';

        return '<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">'
            .(($label !== '' || $showPercentage) ? '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem; font-weight: 600; color: inherit;">'
                .($label !== '' ? '<span>'.$this->e($label).'</span>' : '<span></span>')
                .($showPercentage ? '<span style="font-family: monospace; font-weight: 700;">'.$percentage.'%</span>' : '')
                .'</div>' : '')
            .'<div style="width: 100%; height: '.$this->e($barHeight).'; background: '.$this->e($trackColor).'; border-radius: '.$this->e($borderRadius).'; overflow: hidden;">'
            .'<div class="'.$animClass.'" style="width: '.$percentage.'%; height: 100%; background-color: '.$this->e($barColor).'; border-radius: inherit; transition: width 0.4s ease; '.$stripeBg.'"></div>'
            .'</div>'
            .'</div>'
            .($animated ? '<style>.hw-progress-animated { animation: hw-stripes 1s linear infinite; } @keyframes hw-stripes { from { background-position: 1rem 0; } to { background-position: 0 0; } }</style>' : '');
    }

    private function normalizeVideoEmbedUrl(string $url): string
    {
        $trimmed = trim($url);
        if ($trimmed === '') {
            return '';
        }
        if (preg_match('/(?:youtube\.com\/(?:watch\?.*v=|v\/|embed\/)|youtu\.be\/)([\w-]{11})/i', $trimmed, $m)) {
            return 'https://www.youtube.com/embed/'.$m[1];
        }
        if (preg_match('/(?:vimeo\.com\/(?:video\/)?)([0-9]+)/i', $trimmed, $m)) {
            return 'https://player.vimeo.com/video/'.$m[1];
        }

        return $trimmed;
    }

    private function socialSvg(string $platform, string $dim): string
    {
        return match ($platform) {
            'twitter', 'x' => '<svg width="'.$dim.'" height="'.$dim.'" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
            'instagram' => '<svg width="'.$dim.'" height="'.$dim.'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
            'linkedin' => '<svg width="'.$dim.'" height="'.$dim.'" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28"/></svg>',
            'youtube' => '<svg width="'.$dim.'" height="'.$dim.'" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            'github' => '<svg width="'.$dim.'" height="'.$dim.'" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>',
            'tiktok' => '<svg width="'.$dim.'" height="'.$dim.'" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
            'whatsapp' => '<svg width="'.$dim.'" height="'.$dim.'" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.3"/></svg>',
            default => '<svg width="'.$dim.'" height="'.$dim.'" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
        };
    }

    private function contactForm(array $props, RenderContext $context): string
    {
        $field = 'width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; background: #ffffff; color: #0f172a; padding: 11px 12px; font: inherit; min-width: 0;';

        return '<form style="display: flex; flex-direction: column; gap: 16px;"><div style="display: flex; flex-direction: column; gap: 6px;"><h3 style="margin: 0; color: inherit; font-size: '.($context->breakpoint() === 'mobile' ? '1.25rem' : '1.5rem').'; line-height: 1.25; overflow-wrap: anywhere;">'.$this->e((string) ($props['title'] ?? '')).'</h3><p style="margin: 0; color: inherit; font-size: 0.875rem; line-height: 1.55; opacity: 0.72; overflow-wrap: anywhere;">'.$this->e((string) ($props['description'] ?? '')).'</p></div><label style="display: grid; gap: 6px; font-size: 0.8125rem; font-weight: 700;">'.$this->e((string) ($props['nameLabel'] ?? 'Name')).'<input type="text" style="'.$field.'" /></label><label style="display: grid; gap: 6px; font-size: 0.8125rem; font-weight: 700;">'.$this->e((string) ($props['emailLabel'] ?? 'Email')).'<input type="email" style="'.$field.'" /></label><label style="display: grid; gap: 6px; font-size: 0.8125rem; font-weight: 700;">'.$this->e((string) ($props['messageLabel'] ?? 'Message')).'<textarea rows="5" style="'.$field.' resize: vertical;"></textarea></label><button type="button" style="display: inline-flex; min-height: 44px; align-items: center; justify-content: center; border: 0; border-radius: 12px; background: '.$this->e((string) ($props['accentColor'] ?? '#2563eb')).'; color: #ffffff; padding: 11px 16px; font-size: 0.875rem; font-weight: 800; cursor: pointer;">'.$this->e((string) ($props['buttonText'] ?? 'Send')).'</button></form>';
    }

    /** @return list<array<string, mixed>> */
    private function objects(mixed $value): array
    {
        return array_values(array_filter(is_array($value) ? $value : [], static fn (mixed $item): bool => is_array($item)));
    }

    /** @return list<array{src: string, alt: string, href?: string, name?: string}> */
    private function logoImages(mixed $logos, mixed $fallbackText): array
    {
        $parsed = [];
        foreach (is_array($logos) ? $logos : [] as $item) {
            if (is_array($item)) {
                $src = (string) ($item['src'] ?? '');
                if ($src !== '') {
                    $entry = ['src' => $src, 'alt' => (string) ($item['alt'] ?? 'Logo')];
                    if (! empty($item['href'])) {
                        $entry['href'] = (string) $item['href'];
                    }
                    if (! empty($item['name'])) {
                        $entry['name'] = (string) $item['name'];
                    }
                    $parsed[] = $entry;
                }
            } elseif (is_string($item) && $item !== '') {
                $parsed[] = ['src' => $item, 'alt' => 'Logo'];
            }
        }

        if ($parsed !== []) {
            return $parsed;
        }

        if (is_string($fallbackText) && trim($fallbackText) !== '') {
            $logos = [];
            foreach (array_filter(array_map('trim', preg_split('/\R/', $fallbackText) ?: [])) as $line) {
                [$src, $alt] = array_pad(array_map('trim', explode('|', $line, 2)), 2, '');
                if ($src !== '') {
                    $logos[] = ['src' => $src, 'alt' => $alt !== '' ? $alt : 'Logo'];
                }
            }

            return $logos !== [] ? $logos : [['src' => '/images/helloweb-logo-dark.png', 'alt' => 'HelloWeb']];
        }
        return [['src' => '/images/helloweb-logo-dark.png', 'alt' => 'HelloWeb']];
    }

    private function e(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
