import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Clipboard,
    Columns3,
    Copy,
    Eye,
    EyeOff,
    Lock,
    LockOpen,
    MoreHorizontal,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface NodeActionsOverlayProps {
    nodeId: string;
    label?: string;
    type?: string;
    onDuplicate?: (nodeId: string) => void;
    onRemove?: (nodeId: string) => void;
    onMove?: (nodeId: string, direction: 'up' | 'down') => void;
    canMove?: (nodeId: string, direction: 'up' | 'down') => boolean;
    onCopy?: (nodeId: string) => void;
    onPaste?: (nodeId: string) => void;
    canPaste?: (nodeId: string) => boolean;
    onToggleVisibility?: (nodeId: string) => void;
    hidden?: boolean;
    onToggleLock?: (nodeId: string) => void;
    locked?: boolean;
    onSetFlexDirection?: (nodeId: string, direction: 'row' | 'column' | 'row-reverse' | 'column-reverse') => void;
    onSetFlexStyle?: (nodeId: string, key: 'justifyContent' | 'alignItems' | 'flexWrap', value: string) => void;
    onToggleFullWidth?: (nodeId: string) => void;
    fullWidth?: boolean;
    onAddColumn?: (nodeId: string) => void;
    onAddElement?: (nodeId: string) => void;
    onOpenMediaManager?: (target?: string, nodeId?: string, payload?: any) => void;
    onEdit?: (nodeId: string) => void;
}

export function NodeActionsOverlay({
    nodeId,
    type,
    onDuplicate,
    onRemove,
    onMove,
    canMove,
    onCopy,
    onPaste,
    canPaste,
    onToggleVisibility,
    hidden,
    onToggleLock,
    locked,
    onSetFlexDirection,
    onSetFlexStyle,
    onToggleFullWidth,
    fullWidth,
    onAddColumn,
    onAddElement,
    onOpenMediaManager,
    onEdit,
}: NodeActionsOverlayProps) {
    const [moreOpen, setMoreOpen] = useState(false);
    const isRow = type === 'layout.row';
    const isColumn = type === 'layout.column';
    const isSection = type === 'layout.section';
    const isImage = type === 'media.image' || type === 'marketing.imagefeature';
    const isButton = type === 'content.button';
    const firstMoveLabel = isColumn ? 'Move left' : 'Move up';
    const secondMoveLabel = isColumn ? 'Move right' : 'Move down';

    const action = (handler: (() => void) | undefined) => (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        handler?.();
    };

    return (
        <span
            className="border-border bg-card/95 text-card-foreground pointer-events-auto absolute -top-10 right-0 z-40 flex items-center gap-0.5 rounded-full border px-1.5 py-1 shadow-md backdrop-blur transition"
            data-builder-node-actions-for={nodeId}
        >
            <ToolbarButton label={firstMoveLabel} disabled={!canMove?.(nodeId, 'up')} onClick={action(() => onMove?.(nodeId, 'up'))}>
                {isColumn ? <ArrowLeft className="size-3.5" /> : <ArrowUp className="size-3.5" />}
            </ToolbarButton>
            <ToolbarButton label={secondMoveLabel} disabled={!canMove?.(nodeId, 'down')} onClick={action(() => onMove?.(nodeId, 'down'))}>
                {isColumn ? <ArrowRight className="size-3.5" /> : <ArrowDown className="size-3.5" />}
            </ToolbarButton>

            {isRow ? (
                <>
                    <span className="bg-border mx-0.5 inline-block h-3.5 w-px shrink-0" />
                    <ToolbarButton label="Direction: row" active onClick={action(() => onSetFlexDirection?.(nodeId, 'row'))}>
                        <ArrowRight className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton label="Direction: column" onClick={action(() => onSetFlexDirection?.(nodeId, 'column'))}>
                        <ArrowDown className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                        label={fullWidth ? 'Use content width' : 'Full width'}
                        active={fullWidth}
                        onClick={action(() => onToggleFullWidth?.(nodeId))}
                    >
                        <Columns3 className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton label="Add column" onClick={action(() => onAddColumn?.(nodeId))}>
                        <Plus className="size-3.5" />
                    </ToolbarButton>
                </>
            ) : null}

            {isColumn ? (
                <>
                    <span className="bg-border mx-0.5 inline-block h-3.5 w-px shrink-0" />
                    <ToolbarButton label="Add element" onClick={action(() => onAddElement?.(nodeId))}>
                        <Plus className="size-3.5" />
                    </ToolbarButton>
                </>
            ) : null}

            {isSection ? (
                <>
                    <span className="bg-border mx-0.5 inline-block h-3.5 w-px shrink-0" />
                    <ToolbarButton label="Add row" onClick={action(() => onAddElement?.(nodeId))}>
                        <Plus className="size-3.5" />
                    </ToolbarButton>
                </>
            ) : null}

            {isImage && onOpenMediaManager ? (
                <>
                    <span className="bg-border mx-0.5 inline-block h-3.5 w-px shrink-0" />
                    <ToolbarButton label="Replace image" onClick={action(() => onOpenMediaManager(type === 'marketing.imagefeature' ? 'imagefeature' : 'image', nodeId))}>
                        <Columns3 className="size-3.5" />
                    </ToolbarButton>
                </>
            ) : null}

            {isButton || type === 'content.heading' || type === 'content.text' || type === 'content.richtext' ? (
                <>
                    <span className="bg-border mx-0.5 inline-block h-3.5 w-px shrink-0" />
                    <ToolbarButton label="Edit content" onClick={action(() => onEdit?.(nodeId))}>
                        <span className="text-[11px] font-bold">Aa</span>
                    </ToolbarButton>
                </>
            ) : null}

            <span className="bg-border mx-0.5 inline-block h-3.5 w-px shrink-0" />

            {onCopy ? (
                <ToolbarButton label="Copy" onClick={action(() => onCopy(nodeId))}>
                    <Copy className="size-3.5" />
                </ToolbarButton>
            ) : null}
            {onDuplicate ? (
                <ToolbarButton label="Duplicate" onClick={action(() => onDuplicate(nodeId))}>
                    <Copy className="size-3.5" />
                </ToolbarButton>
            ) : null}
            {onRemove ? (
                <ToolbarButton label="Delete" danger onClick={action(() => onRemove(nodeId))}>
                    <Trash2 className="size-3.5" />
                </ToolbarButton>
            ) : null}

            <span className="relative">
                <button
                    type="button"
                    className="text-foreground/80 hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-full transition"
                    aria-label="More element actions"
                    title="More actions"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setMoreOpen((value) => !value);
                    }}
                >
                    <MoreHorizontal className="size-3.5" />
                </button>
                {moreOpen ? (
                    <span className="bg-card text-card-foreground border-border absolute top-8 right-0 z-50 flex min-w-40 flex-col gap-0.5 rounded-xl border p-1.5 text-left shadow-xl">
                        {isRow ? (
                            <>
                                <MenuButton label="Reverse row" onClick={action(() => onSetFlexDirection?.(nodeId, 'row-reverse'))}>
                                    <ArrowLeft className="size-3.5" />
                                </MenuButton>
                                <MenuButton label="Reverse column" onClick={action(() => onSetFlexDirection?.(nodeId, 'column-reverse'))}>
                                    <ArrowUp className="size-3.5" />
                                </MenuButton>
                                <MenuLabel>Justify</MenuLabel>
                                {['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map((value) => (
                                    <MenuButton
                                        key={value}
                                        label={value.replace('flex-', '')}
                                        onClick={action(() => onSetFlexStyle?.(nodeId, 'justifyContent', value))}
                                    >
                                        <span className="size-3.5" />
                                    </MenuButton>
                                ))}
                                <MenuLabel>Align</MenuLabel>
                                {['flex-start', 'center', 'flex-end', 'stretch'].map((value) => (
                                    <MenuButton
                                        key={value}
                                        label={value.replace('flex-', '')}
                                        onClick={action(() => onSetFlexStyle?.(nodeId, 'alignItems', value))}
                                    >
                                        <span className="size-3.5" />
                                    </MenuButton>
                                ))}
                                <MenuLabel>Wrap</MenuLabel>
                                <MenuButton label="Wrap" onClick={action(() => onSetFlexStyle?.(nodeId, 'flexWrap', 'wrap'))}>
                                    <span className="size-3.5" />
                                </MenuButton>
                                <MenuButton label="No wrap" onClick={action(() => onSetFlexStyle?.(nodeId, 'flexWrap', 'nowrap'))}>
                                    <span className="size-3.5" />
                                </MenuButton>
                            </>
                        ) : null}
                        {onPaste && canPaste?.(nodeId) ? (
                            <MenuButton label="Paste" onClick={action(() => onPaste(nodeId))}>
                                <Clipboard className="size-3.5" />
                            </MenuButton>
                        ) : null}
                        {onToggleVisibility ? (
                            <MenuButton label={hidden ? 'Show' : 'Hide'} onClick={action(() => onToggleVisibility(nodeId))}>
                                {hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                            </MenuButton>
                        ) : null}
                        {onToggleLock ? (
                            <MenuButton label={locked ? 'Unlock' : 'Lock'} onClick={action(() => onToggleLock(nodeId))}>
                                {locked ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
                            </MenuButton>
                        ) : null}
                    </span>
                ) : null}
            </span>
        </span>
    );
}

function ToolbarButton({
    label,
    disabled,
    active,
    danger,
    onClick,
    children,
}: {
    label: string;
    disabled?: boolean;
    active?: boolean;
    danger?: boolean;
    onClick: React.MouseEventHandler;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            className={`text-foreground/80 hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-30 ${
                active ? 'bg-primary/15 text-primary font-medium' : ''
            } ${danger ? 'hover:bg-destructive/15 hover:text-destructive' : ''}`}
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function MenuButton({ label, onClick, children }: { label: string; onClick: React.MouseEventHandler; children: React.ReactNode }) {
    return (
        <button
            type="button"
            className="hover:bg-muted text-foreground flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition"
            onClick={onClick}
        >
            {children}
            <span>{label}</span>
        </button>
    );
}

function MenuLabel({ children }: { children: React.ReactNode }) {
    return <span className="text-muted-foreground px-2.5 pt-1.5 text-[10px] font-semibold tracking-wider uppercase">{children}</span>;
}
