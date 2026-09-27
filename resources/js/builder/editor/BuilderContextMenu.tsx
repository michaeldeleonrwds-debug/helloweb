import {
    ArrowDown,
    ArrowUp,
    ChevronUp,
    ClipboardPaste,
    Command,
    Copy,
    Eye,
    EyeOff,
    Layers,
    Lock,
    Maximize2,
    Plus,
    Redo2,
    RotateCcw,
    SlidersHorizontal,
    Trash2,
    Undo2,
    Unlock,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface ContextMenuTarget {
    type: 'node' | 'canvas';
    x: number;
    y: number;
    nodeId?: string;
    nodeName?: string;
    nodeType?: string;
    parentId?: string | null;
    parentName?: string | null;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    canAcceptChildren?: boolean;
    isLocked?: boolean;
    isHidden?: boolean;
    hasStyles?: boolean;
}

export interface BuilderContextMenuProps {
    target: ContextMenuTarget | null;
    onClose: () => void;
    // Node actions
    onDuplicate?: (nodeId: string) => void;
    onCopy?: (nodeId: string) => void;
    onPaste?: (targetId: string, mode?: 'inside' | 'after') => void;
    canPaste?: boolean;
    onDelete?: (nodeId: string) => void;
    onMove?: (nodeId: string, direction: 'up' | 'down') => void;
    onSelectParent?: (parentId: string) => void;
    onToggleLock?: (nodeId: string) => void;
    onToggleVisibility?: (nodeId: string) => void;
    onResetStyles?: (nodeId: string) => void;
    onAddElement?: (parentId: string) => void;
    onAddSectionBelow?: (nodeId: string) => void;
    onInspect?: (nodeId: string) => void;
    // Canvas actions
    onAddSection?: () => void;
    onUndo?: () => void;
    canUndo?: boolean;
    onRedo?: () => void;
    canRedo?: boolean;
    onZoomReset?: () => void;
    onOpenShortcuts?: () => void;
}

export function BuilderContextMenu({
    target,
    onClose,
    onDuplicate,
    onCopy,
    onPaste,
    canPaste,
    onDelete,
    onMove,
    onSelectParent,
    onToggleLock,
    onToggleVisibility,
    onResetStyles,
    onAddElement,
    onAddSectionBelow,
    onInspect,
    onAddSection,
    onUndo,
    canUndo,
    onRedo,
    canRedo,
    onZoomReset,
    onOpenShortcuts,
}: BuilderContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: target?.x ?? 0, y: target?.y ?? 0 });

    // Clamp coordinates to stay completely within viewport bounds
    useEffect(() => {
        if (!target) return;
        const width = 230;
        const height = target.type === 'node' ? 380 : 240;
        const maxX = window.innerWidth - width - 12;
        const maxY = window.innerHeight - height - 12;

        setPosition({
            x: Math.max(12, Math.min(target.x, maxX)),
            y: Math.max(12, Math.min(target.y, maxY)),
        });
    }, [target]);

    // Close on click outside, Escape key, or window scroll/resize
    useEffect(() => {
        if (!target) return;

        const handlePointerDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleScroll = () => {
            onClose();
        };

        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('scroll', handleScroll, { capture: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleScroll, { capture: true });
            window.removeEventListener('resize', handleScroll);
        };
    }, [target, onClose]);

    if (!target) return null;

    const isNode = target.type === 'node' && target.nodeId;

    return (
        <div
            ref={menuRef}
            className="builder-context-menu fixed z-50 min-w-[220px] max-w-[260px] rounded-xl border border-border/80 bg-card/95 p-1.5 text-card-foreground shadow-2xl backdrop-blur-md select-none transition-all duration-75"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
            role="menu"
            aria-orientation="vertical"
            onContextMenu={(e) => e.preventDefault()}
        >
            {isNode ? (
                <>
                    {/* Header: Element Type & Identifier */}
                    <div className="mb-1 flex items-center justify-between border-b border-border/60 px-2.5 py-1.5">
                        <span className="font-mono text-[10px] font-bold tracking-wider text-primary uppercase truncate max-w-[140px]">
                            {target.nodeName || target.nodeType || 'Element'}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground/70">
                            #{target.nodeId!.slice(0, 6)}
                        </span>
                    </div>

                    {/* Duplicate */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onDuplicate?.(target.nodeId!);
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Layers className="size-3.5 text-muted-foreground" />
                            Duplicate
                        </span>
                        <kbd className="font-mono text-[10px] text-muted-foreground">Ctrl+D</kbd>
                    </button>

                    {/* Copy */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onCopy?.(target.nodeId!);
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Copy className="size-3.5 text-muted-foreground" />
                            Copy
                        </span>
                        <kbd className="font-mono text-[10px] text-muted-foreground">Ctrl+C</kbd>
                    </button>

                    {/* Paste Inside */}
                    {target.canAcceptChildren ? (
                        <button
                            type="button"
                            disabled={!canPaste}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => {
                                onPaste?.(target.nodeId!, 'inside');
                                onClose();
                            }}
                        >
                            <span className="inline-flex items-center gap-2">
                                <ClipboardPaste className="size-3.5 text-muted-foreground" />
                                Paste Inside
                            </span>
                            <kbd className="font-mono text-[10px] text-muted-foreground">Ctrl+V</kbd>
                        </button>
                    ) : null}

                    {/* Paste After Sibling */}
                    {target.parentId ? (
                        <button
                            type="button"
                            disabled={!canPaste}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => {
                                onPaste?.(target.nodeId!, 'after');
                                onClose();
                            }}
                        >
                            <span className="inline-flex items-center gap-2">
                                <ClipboardPaste className="size-3.5 text-muted-foreground" />
                                Paste After
                            </span>
                        </button>
                    ) : null}

                    <div className="my-1 h-px bg-border/60" />

                    {/* Move Up */}
                    <button
                        type="button"
                        disabled={!target.canMoveUp}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => {
                            onMove?.(target.nodeId!, 'up');
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <ArrowUp className="size-3.5 text-muted-foreground" />
                            Move Up
                        </span>
                        <kbd className="font-mono text-[10px] text-muted-foreground">Alt+↑</kbd>
                    </button>

                    {/* Move Down */}
                    <button
                        type="button"
                        disabled={!target.canMoveDown}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => {
                            onMove?.(target.nodeId!, 'down');
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <ArrowDown className="size-3.5 text-muted-foreground" />
                            Move Down
                        </span>
                        <kbd className="font-mono text-[10px] text-muted-foreground">Alt+↓</kbd>
                    </button>

                    {/* Select Parent */}
                    {target.parentId && target.parentId !== 'root' ? (
                        <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                            onClick={() => {
                                onSelectParent?.(target.parentId!);
                                onClose();
                            }}
                        >
                            <span className="inline-flex items-center gap-2 truncate">
                                <ChevronUp className="size-3.5 text-muted-foreground" />
                                Select Parent ({target.parentName || 'Parent'})
                            </span>
                        </button>
                    ) : null}

                    <div className="my-1 h-px bg-border/60" />

                    {/* Insert Child Element */}
                    {target.canAcceptChildren ? (
                        <button
                            type="button"
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                            onClick={() => {
                                onAddElement?.(target.nodeId!);
                                onClose();
                            }}
                        >
                            <span className="inline-flex items-center gap-2">
                                <Plus className="size-3.5 text-primary" />
                                Add Element Inside...
                            </span>
                        </button>
                    ) : null}

                    {/* Add Section Below */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onAddSectionBelow?.(target.nodeId!);
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Plus className="size-3.5 text-muted-foreground" />
                            Add Section Below
                        </span>
                    </button>

                    <div className="my-1 h-px bg-border/60" />

                    {/* Lock / Unlock */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onToggleLock?.(target.nodeId!);
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            {target.isLocked ? (
                                <>
                                    <Unlock className="size-3.5 text-amber-500" />
                                    Unlock Element
                                </>
                            ) : (
                                <>
                                    <Lock className="size-3.5 text-muted-foreground" />
                                    Lock Element
                                </>
                            )}
                        </span>
                    </button>

                    {/* Hide / Show */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onToggleVisibility?.(target.nodeId!);
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            {target.isHidden ? (
                                <>
                                    <Eye className="size-3.5 text-primary" />
                                    Show on this Viewport
                                </>
                            ) : (
                                <>
                                    <EyeOff className="size-3.5 text-muted-foreground" />
                                    Hide on this Viewport
                                </>
                            )}
                        </span>
                    </button>

                    {/* Clear Custom Styles */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onResetStyles?.(target.nodeId!);
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <RotateCcw className="size-3.5 text-muted-foreground" />
                            Reset Custom Styles
                        </span>
                    </button>

                    {/* Inspect Element */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onInspect?.(target.nodeId!);
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                            Inspect Properties
                        </span>
                    </button>

                    <div className="my-1 h-px bg-border/60" />

                    {/* Delete */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 cursor-pointer"
                        onClick={() => {
                            onDelete?.(target.nodeId!);
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Trash2 className="size-3.5" />
                            Delete
                        </span>
                        <kbd className="font-mono text-[10px] text-destructive/80">Del</kbd>
                    </button>
                </>
            ) : (
                <>
                    {/* Empty Canvas Context Menu */}
                    <div className="mb-1 border-b border-border/60 px-2.5 py-1.5">
                        <span className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            Canvas Workspace
                        </span>
                    </div>

                    {/* Add Section */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onAddSection?.();
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Plus className="size-3.5 text-primary" />
                            Add Section
                        </span>
                    </button>

                    {/* Paste */}
                    <button
                        type="button"
                        disabled={!canPaste}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => {
                            onPaste?.('root');
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <ClipboardPaste className="size-3.5 text-muted-foreground" />
                            Paste
                        </span>
                        <kbd className="font-mono text-[10px] text-muted-foreground">Ctrl+V</kbd>
                    </button>

                    <div className="my-1 h-px bg-border/60" />

                    {/* Undo */}
                    <button
                        type="button"
                        disabled={!canUndo}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => {
                            onUndo?.();
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Undo2 className="size-3.5 text-muted-foreground" />
                            Undo
                        </span>
                        <kbd className="font-mono text-[10px] text-muted-foreground">Ctrl+Z</kbd>
                    </button>

                    {/* Redo */}
                    <button
                        type="button"
                        disabled={!canRedo}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => {
                            onRedo?.();
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Redo2 className="size-3.5 text-muted-foreground" />
                            Redo
                        </span>
                        <kbd className="font-mono text-[10px] text-muted-foreground">Ctrl+Y</kbd>
                    </button>

                    <div className="my-1 h-px bg-border/60" />

                    {/* Reset Zoom */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onZoomReset?.();
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Maximize2 className="size-3.5 text-muted-foreground" />
                            Fit Canvas Zoom
                        </span>
                    </button>

                    {/* Shortcuts */}
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer"
                        onClick={() => {
                            onOpenShortcuts?.();
                            onClose();
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <Command className="size-3.5 text-muted-foreground" />
                            Keyboard Shortcuts
                        </span>
                        <kbd className="font-mono text-[10px] text-muted-foreground">Ctrl+/</kbd>
                    </button>
                </>
            )}
        </div>
    );
}
