import assert from 'node:assert/strict';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { BuilderCanvas } from '../resources/js/builder/editor/BuilderCanvas';
import { BuilderEditor } from '../resources/js/builder/editor/BuilderEditor';
import { CanvasNode } from '../resources/js/builder/editor/CanvasNode';
import { hoverCanvasNode, leaveCanvasNode, selectCanvasNode } from '../resources/js/builder/editor/canvas-interactions';
import {
    clearEditorStyleOverride,
    duplicateEditorNode,
    insertEditorComponent,
    removeEditorNode,
    updateEditorMetadata,
    updateEditorProps,
    updateEditorStyles,
} from '../resources/js/builder/editor/editor-operations';
import { editorReducer } from '../resources/js/builder/editor/editor-reducer';
import { createEditorState, getHoveredNode, getSelectedNode, setDocument } from '../resources/js/builder/editor/editor-state';
import { hasVisibleCodeContent } from '../resources/js/builder/editor/render-result-utils';
import { createSampleBuilderDocument, sectionNode } from '../resources/js/builder/editor/sample-document';
import { ComponentTreeEngine } from '../resources/js/builder/engine/component-tree-engine';
import { afterPosition, beforePosition } from '../resources/js/builder/engine/tree-position';
import { createBuiltInComponentRegistry } from '../resources/js/builder/registry/built-ins';
import { BuilderRenderer } from '../resources/js/builder/renderer/builder-renderer';
import { registerBuiltInRenderers } from '../resources/js/builder/renderer/built-ins';
import { renderResultToHtml } from '../resources/js/builder/renderer/render-result';
import { ComponentRendererRegistry } from '../resources/js/builder/renderer/renderer-registry';
import { resolveStyles, serializeStyles } from '../resources/js/builder/style/style';

const document = createSampleBuilderDocument();
const registry = createBuiltInComponentRegistry();
const engine = new ComponentTreeEngine(registry);
assert.equal(registry.get('layout.stack').name, 'Stack');
assert.equal(registry.get('content.button').name, 'Button');
assert.equal(registry.get('marketing.card').name, 'Card');

let operationState = createEditorState(document);
const originalDocument = structuredClone(operationState.document);
operationState = insertEditorComponent(operationState, engine, 'column-1', 'content.heading');
assert.equal(operationState.document.root.children[0].children[0].children[0].children.length, 2);
assert.equal(operationState.selectedNodeId, operationState.document.root.children[0].children[0].children[0].children[1].id);
assert.notEqual(operationState.document, originalDocument);
assert.deepEqual(document, originalDocument);

const beforeDocument = engine.insert(
    document,
    'column-1',
    {
        id: 'heading-before',
        type: 'content.heading',
        props: { text: 'Before', level: 2 },
        styles: {},
        children: [],
    },
    beforePosition('heading-1'),
);
assert.deepEqual(
    beforeDocument.root.children[0].children[0].children[0].children.map((node) => node.id),
    ['heading-before', 'heading-1'],
);
const afterDocument = engine.insert(
    document,
    'column-1',
    { id: 'heading-after', type: 'content.heading', props: { text: 'After', level: 2 }, styles: {}, children: [] },
    afterPosition('heading-1'),
);
assert.deepEqual(
    afterDocument.root.children[0].children[0].children[0].children.map((node) => node.id),
    ['heading-1', 'heading-after'],
);
assert.equal(engine.canAcceptChild(document, 'column-1', 'layout.row'), true);
const nestedRowDocument = engine.insertComponent(document, 'column-1', 'layout.row');
const nestedRow = nestedRowDocument.root.children[0].children[0].children[0].children.find((node) => node.type === 'layout.row');
assert.ok(nestedRow);
assert.equal(engine.canAcceptChild(nestedRowDocument, nestedRow.id, 'layout.column'), true);
const nestedColumnDocument = engine.insertComponent(nestedRowDocument, nestedRow.id, 'layout.column');
const nestedColumn = nestedColumnDocument.root.children[0].children[0].children[0].children
    .find((node) => node.id === nestedRow.id)
    ?.children.find((node) => node.type === 'layout.column');
assert.ok(nestedColumn);
assert.equal(engine.canAcceptChild(nestedColumnDocument, nestedColumn.id, 'content.button'), true);
const nestedButtonDocument = engine.insertComponent(nestedColumnDocument, nestedColumn.id, 'content.button');
assert.equal(engine.find(nestedButtonDocument, nestedColumn.id)?.children[0].type, 'content.button');

const movedDocument = engine.move(document, 'heading-1', 'column-1');
assert.equal(movedDocument.root.children[0].children[0].children[0].children[0].id, 'heading-1');
assert.throws(() => engine.move(document, 'heading-1', 'heading-1', beforePosition('heading-1')));

const duplicatedState = duplicateEditorNode(selectCanvasNode(createEditorState(document), 'column-1'), engine, 'column-1');
assert.notEqual(duplicatedState.selectedNodeId, 'column-1');
assert.equal(duplicatedState.document.root.children[0].children[0].children.length, 2);
assert.notEqual(duplicatedState.document.root.children[0].children[0].children[1].children[0].id, 'heading-1');
assert.deepEqual(document, originalDocument);

const updatedState = updateEditorProps(selectCanvasNode(createEditorState(document), 'heading-1'), engine, 'heading-1', {
    text: 'Updated',
    level: 3,
});
const updatedHeading = updatedState.document.root.children[0].children[0].children[0].children[0];
assert.equal(updatedHeading.props.text, 'Updated');
assert.equal(updatedHeading.props.level, 3);
assert.deepEqual(updatedHeading.styles, document.root.children[0].children[0].children[0].children[0].styles);
assert.throws(() => engine.updateProps(document, 'heading-1', { level: 7 }));

const styledState = updateEditorStyles(createEditorState(document), engine, 'heading-1', 'desktop', { fontSize: '32px' });
const responsiveState = updateEditorStyles(styledState, engine, 'heading-1', 'mobile', { fontSize: '22px' });
const styledHeading = responsiveState.document.root.children[0].children[0].children[0].children[0];
assert.equal(resolveStyles(styledHeading, registry.get('content.heading'), 'tablet').fontSize, '32px');
assert.equal(resolveStyles(styledHeading, registry.get('content.heading'), 'mobile').fontSize, '22px');
assert.equal(serializeStyles({ color: 'red', fontSize: '32px' }), 'color: red; font-size: 32px');
assert.throws(() => engine.updateStyles(document, 'heading-1', 'desktop', { fontSize: 'banana' }));
const backgroundImageState = updateEditorStyles(createEditorState(document), engine, 'section-1', 'desktop', {
    backgroundType: 'image',
    backgroundImage: '/storage/builder/1/hero.png',
});
const backgroundSection = backgroundImageState.document.root.children[0];
assert.equal(backgroundSection.styles.desktop?.backgroundImage, '/storage/builder/1/hero.png');
assert.equal(backgroundSection.styles.desktop?.backgroundType, 'image');
const clearedState = clearEditorStyleOverride(responsiveState, engine, 'heading-1', 'mobile', 'fontSize');
assert.equal(clearedState.document.root.children[0].children[0].children[0].children[0].styles.mobile, undefined);
assert.throws(() => engine.insert(document, 'heading-1', document.root.children[0].children[0].children[0].children[0]));

let dragState = editorReducer(createEditorState(document), { type: 'startDrag', nodeId: 'heading-1' });
assert.equal(dragState.draggedNodeId, 'heading-1');
dragState = editorReducer(dragState, { type: 'setDropTarget', target: { parentId: 'column-1', position: afterPosition('heading-1') } });
assert.equal(dragState.dropTarget?.parentId, 'column-1');
dragState = editorReducer(dragState, { type: 'clearDrag' });
assert.equal(dragState.draggedNodeId, null);

const removedState = removeEditorNode(selectCanvasNode(createEditorState(document), 'column-1'), engine, 'column-1');
assert.equal(removedState.selectedNodeId, null);
assert.equal(engine.find(removedState.document, 'heading-1'), null);

let state = createEditorState(document);
assert.equal(state.selectedNodeId, null);
assert.equal(state.hoveredNodeId, null);
assert.deepEqual(state.document, document);
assert.notEqual(state.document, document);

state = selectCanvasNode(state, 'section-1');
assert.equal(state.selectedNodeId, 'section-1');
assert.equal(getSelectedNode(state)?.type, 'layout.section');

state = selectCanvasNode(state, 'column-1');
assert.equal(state.selectedNodeId, 'column-1');
assert.equal(getSelectedNode(state)?.type, 'layout.column');

state = selectCanvasNode(state, 'heading-1');
assert.equal(state.selectedNodeId, 'heading-1');
assert.equal(getSelectedNode(state)?.type, 'content.heading');

state = selectCanvasNode(state, 'node_root');
assert.equal(state.selectedNodeId, null);

state = selectCanvasNode(state, 'heading-1');
state = hoverCanvasNode(state, 'column-1');
assert.equal(state.hoveredNodeId, 'column-1');
assert.equal(getHoveredNode(state)?.type, 'layout.column');

state = leaveCanvasNode(state, 'heading-1');
assert.equal(state.hoveredNodeId, 'column-1');
state = leaveCanvasNode(state, 'column-1');
assert.equal(state.hoveredNodeId, null);

const originalBeforeInteraction = structuredClone(document);
state = hoverCanvasNode(selectCanvasNode(createEditorState(document), 'heading-1'), 'heading-1');
assert.deepEqual(document, originalBeforeInteraction);

const documentWithoutHeading = structuredClone(document);
documentWithoutHeading.root.children[0].children[0].children[0].children = [];
state = setDocument(state, documentWithoutHeading);
assert.equal(state.selectedNodeId, null);
assert.equal(state.hoveredNodeId, null);
assert.equal(getSelectedNode(state), null);
assert.equal(getHoveredNode(state), null);

const siblingDocument = structuredClone(document);
siblingDocument.root.children.push(sectionNode('section-2'));
state = selectCanvasNode(createEditorState(siblingDocument), 'section-1');
state = selectCanvasNode(state, 'section-2');
assert.equal(state.selectedNodeId, 'section-2');

const renderer = new BuilderRenderer({
    breakpoint: 'desktop',
    componentRegistry: createBuiltInComponentRegistry(),
    rendererRegistry: registerBuiltInRenderers(new ComponentRendererRegistry()),
});
const rendered = renderer.renderDocument(document);
const html = renderResultToHtml(rendered);
assert.match(html, /Hello Builder/);

const canvasMarkup = renderToStaticMarkup(createElement(BuilderCanvas, { document }));
assert.match(canvasMarkup, /data-builder-canvas="true"/);
assert.match(canvasMarkup, /data-builder-node-id="section-1"/);
assert.match(canvasMarkup, /data-builder-node-id="column-1"/);
assert.match(canvasMarkup, /data-builder-node-id="heading-1"/);
assert.doesNotMatch(canvasMarkup, /data-builder-node-id="node_root"/);

const selectedCanvasMarkup = renderToStaticMarkup(
    createElement(CanvasNode, {
        result: rendered,
        selectedNodeId: 'heading-1',
        hoveredNodeId: null,
        onSelectNode: () => undefined,
        onHoverNode: () => undefined,
        onClearHover: () => undefined,
    }),
);
assert.match(selectedCanvasMarkup, /data-builder-selection-for="heading-1"/);
assert.doesNotMatch(selectedCanvasMarkup, /data-builder-selection-for="column-1"/);

const editorMarkup = renderToStaticMarkup(createElement(BuilderEditor, { document }));
assert.match(editorMarkup, /data-builder-editor="true"/);
assert.match(editorMarkup, /Elements/);
assert.match(editorMarkup, /Layers/);
assert.match(editorMarkup, /data-layer-node-id="section-1"/);
assert.match(editorMarkup, /Select an element/);

const hoveredCanvasMarkup = renderToStaticMarkup(
    createElement(CanvasNode, {
        result: rendered,
        selectedNodeId: null,
        hoveredNodeId: 'column-1',
        onSelectNode: () => undefined,
        onHoverNode: () => undefined,
        onClearHover: () => undefined,
    }),
);
assert.match(hoveredCanvasMarkup, /data-builder-hover-for="column-1"/);
assert.doesNotMatch(hoveredCanvasMarkup, /data-builder-hover-for="heading-1"/);

assert.deepEqual(document, originalBeforeInteraction);

const metadataState = updateEditorMetadata(createEditorState(document), engine, 'heading-1', { customCss: 'letter-spacing: 0.05em;' });
assert.equal(
    metadataState.document.root.children[0].children[0].children[0].children[0].metadata?.customCss,
    'letter-spacing: 0.05em;',
);
const clearedMetadataState = updateEditorMetadata(metadataState, engine, 'heading-1', { customCss: undefined });
assert.equal(clearedMetadataState.document.root.children[0].children[0].children[0].children[0].metadata, undefined);

const customCssDocument = structuredClone(document);
customCssDocument.root.children[0].children[0].children[0].children[0].metadata = {
    customCss: 'letter-spacing: 0.05em;\n&:hover { opacity: 0.85; }',
};
const customCssHtml = renderResultToHtml(renderer.renderDocument(customCssDocument));
assert.match(customCssHtml, /<style>\[data-builder-css-scope="heading-1"\] \{/);
assert.match(customCssHtml, /letter-spacing: 0\.05em;/);
assert.match(customCssHtml, /&:hover \{ opacity: 0\.85; \}/);
assert.doesNotMatch(customCssHtml, /&amp;:hover/);
assert.match(customCssHtml, /<h1[^>]*data-builder-css-scope="heading-1"/);
assert.doesNotMatch(renderResultToHtml(renderer.renderDocument(document)), /data-builder-css-scope/);

const effectsDocument = structuredClone(document);
effectsDocument.root.children[0].styles.desktop = {
    ...(effectsDocument.root.children[0].styles.desktop ?? {}),
    dropShadowX: 4,
    dropShadowY: 10,
    dropShadowBlur: 30,
    dropShadowSpread: 2,
    dropShadowColor: 'rgba(2,6,23,0.4)',
    layerBlur: 5,
    backgroundBlur: 6,
    glassRefraction: 40,
    glassOpacity: 20,
};
const effectsHtml = renderResultToHtml(renderer.renderDocument(effectsDocument));
assert.match(effectsHtml, /box-shadow: 4px 10px 30px 2px rgba\(2,6,23,0\.4\)/);
assert.match(effectsHtml, /filter: blur\(5px\)/);
assert.match(effectsHtml, /backdrop-filter: blur\(6px\) saturate\(140%\) contrast\(116%\)/);
assert.match(effectsHtml, /background-image: linear-gradient\(135deg, rgba\(255,255,255,0\.200\), rgba\(255,255,255,0\.060\) 45%, rgba\(255,255,255,0\)\)/);
assert.doesNotMatch(effectsHtml, /drop-shadow-x/);
assert.doesNotMatch(effectsHtml, /layer-blur/);
assert.doesNotMatch(effectsHtml, /glass-refraction/);

const innerShadowDocument = structuredClone(document);
innerShadowDocument.root.children[0].styles.desktop = {
    ...(innerShadowDocument.root.children[0].styles.desktop ?? {}),
    boxShadow: '0 8px 24px rgba(0,0,0,.12)',
    innerShadowX: 0,
    innerShadowY: 1,
    innerShadowBlur: 4,
    innerShadowSpread: 0,
    innerShadowColor: 'rgba(255,255,255,0.5)',
    glassDepth: 24,
    glassSplay: 35,
    glassLightDegree: 90,
    glassOpacity: 16,
    dropShadowY: 8,
};
const innerShadowHtml = renderResultToHtml(renderer.renderDocument(innerShadowDocument));
assert.match(
    innerShadowHtml,
    /box-shadow: inset 0px 1px 4px 0px rgba\(255,255,255,0\.5\), inset 0 2\.88px 9\.6px rgba\(255,255,255,0\.325\), inset 0 -1\.73px 12px rgba\(15,23,42,0\.072\), 0px 8px 24px 0px rgba\(15,23,42,0\.18\), 0 8px 24px rgba\(0,0,0,\.12\)/,
);
assert.doesNotMatch(innerShadowHtml, /inner-shadow-y/);
assert.doesNotMatch(innerShadowHtml, /glass-depth/);
assert.doesNotMatch(innerShadowHtml, /drop-shadow-y/);

const customCodeDocument = structuredClone(document);
customCodeDocument.root.children[0].children[0].children[0].children.push({
    id: 'code-1',
    type: 'code.customcode',
    props: {
        code: '<div class="promo">Hi &amp; bye</div>\n<style>.promo{color:red}</style>\n<script>window.__customCode = true;</script>',
    },
    styles: {},
    children: [],
    metadata: {},
});
const customCodeHtml = renderResultToHtml(renderer.renderDocument(customCodeDocument));
assert.match(customCodeHtml, /data-builder-type="code\.customcode"/);
assert.match(customCodeHtml, /<div class="promo">Hi &amp; bye<\/div>/);
assert.match(customCodeHtml, /<style>\.promo\{color:red\}<\/style>/);
assert.match(customCodeHtml, /<script>window\.__customCode = true;<\/script>/);
assert.doesNotMatch(customCodeHtml, /&lt;script&gt;/);
assert.doesNotMatch(customCodeHtml, /code\.customcss/);
assert.doesNotMatch(customCodeHtml, /display: contents/);

assert.equal(hasVisibleCodeContent(''), false);
assert.equal(hasVisibleCodeContent('<!-- just a comment -->'), false);
assert.equal(hasVisibleCodeContent('<style>.a{color:red}</style>\n<script>window.__x = true;</script>'), false);
assert.equal(hasVisibleCodeContent('<div></div><span></span>'), false);
assert.equal(hasVisibleCodeContent('<div>Hi</div>'), true);
assert.equal(hasVisibleCodeContent('<img src="/x.png" alt="">'), true);

const customCodeResult = renderer.renderDocument(customCodeDocument);
const visibleCodePlaceholderMarkup = renderToStaticMarkup(
    createElement(CanvasNode, {
        result: customCodeResult,
        selectedNodeId: 'code-1',
        hoveredNodeId: null,
        onSelectNode: () => undefined,
        onHoverNode: () => undefined,
        onClearHover: () => undefined,
    }),
);
assert.doesNotMatch(visibleCodePlaceholderMarkup, /data-builder-code-placeholder/);

const invisibleCodeDocument = structuredClone(document);
invisibleCodeDocument.root.children[0].children[0].children[0].children.push({
    id: 'code-2',
    type: 'code.customcode',
    props: { code: '<style>.hidden-code{color:red}</style>\n<script>window.__hidden = true;</script>' },
    styles: {},
    children: [],
    metadata: {},
});
const invisibleCodePlaceholderMarkup = renderToStaticMarkup(
    createElement(CanvasNode, {
        result: renderer.renderDocument(invisibleCodeDocument),
        selectedNodeId: 'code-2',
        hoveredNodeId: null,
        onSelectNode: () => undefined,
        onHoverNode: () => undefined,
        onClearHover: () => undefined,
    }),
);
assert.match(invisibleCodePlaceholderMarkup, /data-builder-code-placeholder="true"/);
assert.match(invisibleCodePlaceholderMarkup, /min-height:\s*56px/);
assert.match(invisibleCodePlaceholderMarkup, />Custom code</);
assert.match(invisibleCodePlaceholderMarkup, /display:block/);
assert.doesNotMatch(invisibleCodePlaceholderMarkup, /display: contents/);

const publicInvisibleCodeHtml = renderResultToHtml(renderer.renderDocument(invisibleCodeDocument));
assert.doesNotMatch(publicInvisibleCodeHtml, /data-builder-code-placeholder/);
assert.doesNotMatch(publicInvisibleCodeHtml, /min-height/);
assert.match(publicInvisibleCodeHtml, /display: contents/);

const defaultCustomCode = String(registry.get('code.customcode').defaultProps.code);
assert.doesNotMatch(defaultCustomCode, /<div/i);
assert.match(defaultCustomCode, /<style>/);
assert.match(defaultCustomCode, /<script>/);
assert.equal(hasVisibleCodeContent(defaultCustomCode), false);

const defaultCodeDocument = structuredClone(document);
defaultCodeDocument.root.children[0].children[0].children[0].children.push({
    id: 'code-3',
    type: 'code.customcode',
    props: { code: defaultCustomCode },
    styles: {},
    children: [],
    metadata: {},
});
const defaultCodeHtml = renderResultToHtml(renderer.renderDocument(defaultCodeDocument));
assert.doesNotMatch(defaultCodeHtml, /Custom code/);
assert.doesNotMatch(defaultCodeHtml, /data-builder-code-placeholder/);
assert.match(defaultCodeHtml, /<style>/);
assert.match(defaultCodeHtml, /<script>/);
assert.match(defaultCodeHtml, /display: contents/);

const defaultCodePlaceholderMarkup = renderToStaticMarkup(
    createElement(CanvasNode, {
        result: renderer.renderDocument(defaultCodeDocument),
        selectedNodeId: 'code-3',
        hoveredNodeId: null,
        onSelectNode: () => undefined,
        onHoverNode: () => undefined,
        onClearHover: () => undefined,
    }),
);
assert.match(defaultCodePlaceholderMarkup, /data-builder-code-placeholder="true"/);
assert.match(defaultCodePlaceholderMarkup, /display:block/);
assert.doesNotMatch(defaultCodePlaceholderMarkup, /display: contents/);

const classedCodeDocument = structuredClone(document);
classedCodeDocument.root.children[0].children[0].children[0].children.push({
    id: 'code-4',
    type: 'code.customcode',
    props: { code: '<style>.classed-code{color:red}</style>' },
    styles: {},
    children: [],
    metadata: { className: 'code-anchor' },
});
const classedCodeHtml = renderResultToHtml(renderer.renderDocument(classedCodeDocument));
assert.doesNotMatch(classedCodeHtml, /display: contents/);
assert.match(classedCodeHtml, /class="code-anchor"/);

assert.ok(registry.get('layout.section').childRules?.allowedTypes.includes('code.customcode'));
assert.ok(registry.get('layout.row').childRules?.allowedTypes.includes('code.customcode'));
assert.ok(engine.canAcceptChild(document, 'section-1', 'code.customcode'));
assert.ok(engine.canAcceptChild(document, 'row-1', 'code.customcode'));

const sectionPlacedCode = engine.move(defaultCodeDocument, 'code-3', 'section-1');
assert.equal(engine.findParent(sectionPlacedCode, 'code-3')?.id, 'section-1');
const rowPlacedCode = engine.move(sectionPlacedCode, 'code-3', 'row-1');
assert.equal(engine.findParent(rowPlacedCode, 'code-3')?.id, 'row-1');

console.log('builder editor tests: ok');
