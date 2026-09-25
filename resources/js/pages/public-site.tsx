import { Head, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';

import type { BuilderBreakpoint, BuilderPageDocument, JsonValue } from '@/builder/document';
import { renderStyleToReactStyle } from '@/builder/editor/render-result-utils';
import { createBuiltInComponentRegistry } from '@/builder/registry/built-ins';
import { BuilderRenderer } from '@/builder/renderer/builder-renderer';
import { registerBuiltInRenderers } from '@/builder/renderer/built-ins';
import type { RenderContext } from '@/builder/renderer/render-context';
import type { RenderResult } from '@/builder/renderer/render-result';
import { ComponentRendererRegistry } from '@/builder/renderer/renderer-registry';

interface PublicSiteProps extends Record<string, unknown> {
    website: { name: string; title: string; tagline: string | null; faviconUrl: string | null };
    page: { title: string; slug: string };
    document: BuilderPageDocument;
}

const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export default function PublicSite() {
    const { website, page, document } = usePage<PublicSiteProps>().props;
    const breakpoint = useViewportBreakpoint();
    const scopedCss = typeof document.metadata?.scopedCss === 'string' ? document.metadata.scopedCss : '';
    const globalHeadCode = (typeof document.metadata?.globalHeadCode === 'string' ? document.metadata.globalHeadCode : '') +
        (scopedCss ? `\n<style>\n${scopedCss}\n</style>` : '');
    const globalFooterCode = typeof document.metadata?.globalFooterCode === 'string' ? document.metadata.globalFooterCode : '';
    const [lightbox, setLightbox] = useState<{
        images: { src: string; caption?: string }[];
        activeIndex: number;
    } | null>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            // Handle Navbar Hamburger Toggle
            const navToggle = target.closest<HTMLElement>('[data-hw-nav-toggle]');
            if (navToggle) {
                const header = navToggle.closest('header, nav, [data-builder-type="layout.navbar"]');
                const menu = header?.querySelector<HTMLElement>('[data-hw-nav-menu]');
                if (menu) {
                    menu.classList.toggle('is-open');
                    const isOpen = menu.classList.contains('is-open');
                    menu.style.display = isOpen ? 'flex' : 'none';
                }
                return;
            }

            // Handle Gallery Lightbox
            const galleryItem = target.closest<HTMLElement>('[data-hw-gallery-item]');
            if (galleryItem) {
                const grid = galleryItem.closest('.hw-gallery-grid') || galleryItem.parentElement;
                if (!grid) return;
                const items = Array.from(grid.querySelectorAll<HTMLElement>('[data-hw-gallery-item]'));
                const images = items.map((it) => ({
                    src: it.getAttribute('data-src') || '',
                    caption: it.getAttribute('data-caption') || '',
                }));
                const index = items.indexOf(galleryItem);
                setLightbox({ images, activeIndex: Math.max(0, index) });
            }
        };

        window.document.addEventListener('click', handleClick);
        return () => window.document.removeEventListener('click', handleClick);
    }, []);

    const result = useMemo(() => {
        const context: RenderContext = {
            breakpoint,
            componentRegistry: createBuiltInComponentRegistry(),
            rendererRegistry: registerBuiltInRenderers(new ComponentRendererRegistry()),
        };

        return new BuilderRenderer(context).renderDocument(document);
    }, [breakpoint, document]);

    return (
        <>
            <Head title={page.title === 'Home' ? website.title : `${page.title} | ${website.title}`}>
                {website.faviconUrl ? <link rel="icon" href={website.faviconUrl} /> : null}
                {website.tagline ? <meta name="description" content={website.tagline} /> : null}
            </Head>
            <GlobalCodeEffects headCode={globalHeadCode} footerCode={globalFooterCode} />
            <main className="min-h-screen bg-white text-slate-950">
                <PublicRenderNode result={result} />
            </main>
            {lightbox ? (
                <GalleryLightboxModal
                    lightbox={lightbox}
                    onClose={() => setLightbox(null)}
                    onNavigate={(index) => setLightbox((prev) => (prev ? { ...prev, activeIndex: index } : null))}
                />
            ) : null}
        </>
    );
}

function GlobalCodeEffects({ headCode, footerCode }: { headCode: string; footerCode: string }) {
    useEffect(() => {
        const headNodes = appendCode(document.head, headCode);
        const footerNodes = appendCode(document.body, footerCode);

        return () => {
            [...headNodes, ...footerNodes].forEach((node) => node.parentNode?.removeChild(node));
        };
    }, [headCode, footerCode]);

    return null;
}

function appendCode(target: HTMLElement, html: string): Node[] {
    if (html.trim() === '') return [];

    const template = document.createElement('template');
    template.innerHTML = html;
    const nodes = Array.from(template.content.childNodes).map((node) => executableNode(node));
    nodes.forEach((node) => target.appendChild(node));

    return nodes;
}

function executableNode(node: Node): Node {
    if (!(node instanceof HTMLScriptElement)) return node;

    const script = document.createElement('script');
    Array.from(node.attributes).forEach((attribute) => script.setAttribute(attribute.name, attribute.value));
    script.text = node.text;

    return script;
}

function useViewportBreakpoint(): BuilderBreakpoint {
    const [breakpoint, setBreakpoint] = useState<BuilderBreakpoint>(() => breakpointForViewport());

    useEffect(() => {
        const handleResize = () => setBreakpoint(breakpointForViewport());

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return breakpoint;
}

function breakpointForViewport(width = typeof window === 'undefined' ? 1280 : window.innerWidth): BuilderBreakpoint {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';

    return 'desktop';
}

function PublicRenderNode({ result }: { result: RenderResult }) {
    const children = result.children.map((child, index) => <PublicRenderNode key={child.attributes['data-builder-id'] ?? index} result={child} />);
    const html = result.tag !== null && result.html && children.length === 0 ? result.html : undefined;
    const contentRef = useExecutableHtml(html);

    if (result.tag === null)
        return (
            <>
                {result.text}
                {children}
            </>
        );

    const attributes = reactAttributes(
        Object.entries(result.attributes).filter(([name]) => name !== 'data-builder-id' && name !== 'data-builder-type'),
    );
    const props = {
        ...attributes,
        style: renderStyleToReactStyle(result.styles as Record<string, JsonValue>),
        ref: contentRef,
    };

    if (voidElements.has(result.tag)) return createElement(result.tag, props);
    if (contentRef) return createElement(result.tag, props);

    return createElement(result.tag, props, result.text, children);
}

function useExecutableHtml(html: string | undefined) {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const target = ref.current;
        if (!target || html === undefined) return;

        const template = document.createElement('template');
        template.innerHTML = html;
        target.replaceChildren(...Array.from(template.content.childNodes));
        target.querySelectorAll('script').forEach((script) => script.replaceWith(executableNode(script)));
    }, [html]);

    return html === undefined ? undefined : ref;
}

function reactAttributes(entries: [string, string][]): Record<string, string> {
    const attributes = Object.fromEntries(entries);
    if (attributes.class) {
        attributes.className = attributes.class;
        delete attributes.class;
    }

    return attributes;
}

function GalleryLightboxModal({
    lightbox,
    onClose,
    onNavigate,
}: {
    lightbox: { images: { src: string; caption?: string }[]; activeIndex: number };
    onClose: () => void;
    onNavigate: (index: number) => void;
}) {
    const current = lightbox.images[lightbox.activeIndex];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') onNavigate((lightbox.activeIndex - 1 + lightbox.images.length) % lightbox.images.length);
            else if (e.key === 'ArrowRight') onNavigate((lightbox.activeIndex + 1) % lightbox.images.length);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightbox, onClose, onNavigate]);

    if (!current) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xs"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
                aria-label="Close lightbox"
            >
                <X className="size-6" />
            </button>

            {lightbox.images.length > 1 ? (
                <>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate((lightbox.activeIndex - 1 + lightbox.images.length) % lightbox.images.length);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onNavigate((lightbox.activeIndex + 1) % lightbox.images.length);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
                        aria-label="Next image"
                    >
                        <ChevronRight className="size-6" />
                    </button>
                </>
            ) : null}

            <div
                className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={current.src}
                    alt={current.caption || ''}
                    className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                />
                {current.caption ? (
                    <div className="mt-3 text-center text-sm font-medium text-white/90">
                        {current.caption}
                    </div>
                ) : null}
                <div className="mt-1 text-center text-xs text-white/60">
                    {lightbox.activeIndex + 1} / {lightbox.images.length}
                </div>
            </div>
        </div>
    );
}

