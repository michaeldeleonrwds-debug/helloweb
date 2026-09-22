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
    updateEditorProps,
    updateEditorStyles,
} from '../resources/js/builder/editor/editor-operations';
import { editorReducer } from '../resources/js/builder/editor/editor-reducer';
import { createEditorState, getHoveredNode, getSelectedNode, setDocument } from '../resources/js/builder/editor/editor-state';
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
operationState = insertEditorComponent(operationState, engine, 'container-1', 'content.heading');
assert.equal(operationState.document.root.children[0].children[0].children.length, 2);
assert.equal(operationState.selectedNodeId, operationState.document.root.children[0].children[0].children[1].id);
assert.notEqual(operationState.document, originalDocument);
assert.deepEqual(document, originalDocument);

const beforeDocument = engine.insert(
    document,
    'container-1',
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
    beforeDocument.root.children[0].children[0].children.map((node) => node.id),
    ['heading-before', 'heading-1'],
);
const afterDocument = engine.insert(
    document,
    'container-1',
    { id: 'heading-after', type: 'content.heading', props: { text: 'After', level: 2 }, styles: {}, children: [] },
    afterPosition('heading-1'),
);
assert.deepEqual(
    afterDocument.root.children[0].children[0].children.map((node) => node.id),
    ['heading-1', 'heading-after'],
);

const movedDocument = engine.move(document, 'heading-1', 'section-1');
assert.equal(movedDocument.root.children[0].children[0].children.length, 0);
assert.equal(movedDocument.root.children[0].children[1].id, 'heading-1');
assert.throws(() => engine.move(document, 'heading-1', 'heading-1', beforePosition('heading-1')));

const duplicatedState = duplicateEditorNode(selectCanvasNode(createEditorState(document), 'container-1'), engine, 'container-1');
assert.notEqual(duplicatedState.selectedNodeId, 'container-1');
assert.equal(duplicatedState.document.root.children[0].children.length, 2);
assert.notEqual(duplicatedState.document.root.children[0].children[1].children[0].id, 'heading-1');
assert.deepEqual(document, originalDocument);

const updatedState = updateEditorProps(selectCanvasNode(createEditorState(document), 'heading-1'), engine, 'heading-1', {
    text: 'Updated',
    level: 3,
});
const updatedHeading = updatedState.document.root.children[0].children[0].children[0];
assert.equal(updatedHeading.props.text, 'Updated');
assert.equal(updatedHeading.props.level, 3);
assert.deepEqual(updatedHeading.styles, document.root.children[0].children[0].children[0].styles);
assert.throws(() => engine.updateProps(document, 'heading-1', { level: 7 }));

const styledState = updateEditorStyles(createEditorState(document), engine, 'heading-1', 'desktop', { fontSize: '32px' });
const responsiveState = updateEditorStyles(styledState, engine, 'heading-1', 'mobile', { fontSize: '22px' });
const styledHeading = responsiveState.document.root.children[0].children[0].children[0];
assert.equal(resolveStyles(styledHeading, registry.get('content.heading'), 'tablet').fontSize, '32px');
assert.equal(resolveStyles(styledHeading, registry.get('content.heading'), 'mobile').fontSize, '22px');
assert.equal(serializeStyles({ color: 'red', fontSize: '32px' }), 'color: red; font-size: 32px');
assert.throws(() => engine.updateStyles(document, 'heading-1', 'desktop', { fontSize: 'banana' }));
const clearedState = clearEditorStyleOverride(responsiveState, engine, 'heading-1', 'mobile', 'fontSize');
assert.equal(clearedState.document.root.children[0].children[0].children[0].styles.mobile, undefined);
assert.throws(() => engine.insert(document, 'heading-1', document.root.children[0].children[0].children[0]));

let dragState = editorReducer(createEditorState(document), { type: 'startDrag', nodeId: 'heading-1' });
assert.equal(dragState.draggedNodeId, 'heading-1');
dragState = editorReducer(dragState, { type: 'setDropTarget', target: { parentId: 'container-1', position: afterPosition('heading-1') } });
assert.equal(dragState.dropTarget?.parentId, 'container-1');
dragState = editorReducer(dragState, { type: 'clearDrag' });
assert.equal(dragState.draggedNodeId, null);

const removedState = removeEditorNode(selectCanvasNode(createEditorState(document), 'container-1'), engine, 'container-1');
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

state = selectCanvasNode(state, 'container-1');
assert.equal(state.selectedNodeId, 'container-1');
assert.equal(getSelectedNode(state)?.type, 'layout.container');

state = selectCanvasNode(state, 'heading-1');
assert.equal(state.selectedNodeId, 'heading-1');
assert.equal(getSelectedNode(state)?.type, 'content.heading');

state = selectCanvasNode(state, 'node_root');
assert.equal(state.selectedNodeId, null);

state = selectCanvasNode(state, 'heading-1');
state = hoverCanvasNode(state, 'container-1');
assert.equal(state.hoveredNodeId, 'container-1');
assert.equal(getHoveredNode(state)?.type, 'layout.container');

state = leaveCanvasNode(state, 'heading-1');
assert.equal(state.hoveredNodeId, 'container-1');
state = leaveCanvasNode(state, 'container-1');
assert.equal(state.hoveredNodeId, null);

const originalBeforeInteraction = structuredClone(document);
state = hoverCanvasNode(selectCanvasNode(createEditorState(document), 'heading-1'), 'heading-1');
assert.deepEqual(document, originalBeforeInteraction);

const documentWithoutHeading = structuredClone(document);
documentWithoutHeading.root.children[0].children[0].children = [];
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
assert.match(canvasMarkup, /data-builder-node-id="container-1"/);
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
assert.doesNotMatch(selectedCanvasMarkup, /data-builder-selection-for="container-1"/);

const editorMarkup = renderToStaticMarkup(createElement(BuilderEditor, { document }));
assert.match(editorMarkup, /data-builder-editor="true"/);
assert.match(editorMarkup, /Elements/);
assert.match(editorMarkup, /Layers/);
assert.match(editorMarkup, /data-layer-node-id="section-1"/);
assert.match(editorMarkup, /Nothing selected/);

const hoveredCanvasMarkup = renderToStaticMarkup(
    createElement(CanvasNode, {
        result: rendered,
        selectedNodeId: null,
        hoveredNodeId: 'container-1',
        onSelectNode: () => undefined,
        onHoverNode: () => undefined,
        onClearHover: () => undefined,
    }),
);
assert.match(hoveredCanvasMarkup, /data-builder-hover-for="container-1"/);
assert.doesNotMatch(hoveredCanvasMarkup, /data-builder-hover-for="heading-1"/);

assert.deepEqual(document, originalBeforeInteraction);
console.log('builder editor tests: ok');
