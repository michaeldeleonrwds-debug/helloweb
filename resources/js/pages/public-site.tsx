import { Head, usePage } from '@inertiajs/react';
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
    const globalHeadCode = typeof document.metadata?.globalHeadCode === 'string' ? document.metadata.globalHeadCode : '';
    const globalFooterCode = typeof document.metadata?.globalFooterCode === 'string' ? document.metadata.globalFooterCode : '';
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
