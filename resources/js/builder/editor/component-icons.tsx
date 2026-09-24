import {
    AlignLeft,
    Box,
    Boxes,
    Code2,
    Columns2,
    Columns3,
    ExternalLink,
    FileText,
    Grid3X3,
    Heading,
    Image,
    Layers,
    LayoutTemplate,
    Minus,
    Plus,
    RectangleHorizontal,
    Rows3,
    SeparatorHorizontal,
    Sparkles,
    SquareDashed,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface ComponentVisualInfo {
    icon: (className?: string) => ReactNode;
    textColor: string;
    bgColor: string;
    borderColor: string;
    category: string;
}

const VISUAL_REGISTRY: Record<string, {
    renderIcon: (className?: string) => ReactNode;
    textColor: string;
    bgColor: string;
    borderColor: string;
    category: string;
}> = {
    'layout.section': {
        renderIcon: (cls = 'size-4') => <LayoutTemplate className={cls} />,
        textColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        category: 'layout',
    },
    'layout.row': {
        renderIcon: (cls = 'size-4') => <Rows3 className={cls} />,
        textColor: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
        category: 'layout',
    },
    'layout.column': {
        renderIcon: (cls = 'size-4') => <Columns2 className={cls} />,
        textColor: 'text-sky-600 dark:text-sky-400',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/20',
        category: 'layout',
    },
    'layout.container': {
        renderIcon: (cls = 'size-4') => <Box className={cls} />,
        textColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        category: 'layout',
    },
    'layout.stack': {
        renderIcon: (cls = 'size-4') => <Layers className={cls} />,
        textColor: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/20',
        category: 'layout',
    },
    'layout.flex': {
        renderIcon: (cls = 'size-4') => <Boxes className={cls} />,
        textColor: 'text-teal-600 dark:text-teal-400',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/20',
        category: 'layout',
    },
    'layout.grid': {
        renderIcon: (cls = 'size-4') => <Grid3X3 className={cls} />,
        textColor: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        category: 'layout',
    },
    'layout.columns': {
        renderIcon: (cls = 'size-4') => <Columns3 className={cls} />,
        textColor: 'text-cyan-600 dark:text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        category: 'layout',
    },
    'layout.spacer': {
        renderIcon: (cls = 'size-4') => <SeparatorHorizontal className={cls} />,
        textColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        category: 'layout',
    },
    'layout.divider': {
        renderIcon: (cls = 'size-4') => <Minus className={cls} />,
        textColor: 'text-slate-500 dark:text-slate-400',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/20',
        category: 'layout',
    },
    'content.heading': {
        renderIcon: (cls = 'size-4') => <Heading className={cls} />,
        textColor: 'text-violet-600 dark:text-violet-400',
        bgColor: 'bg-violet-500/10',
        borderColor: 'border-violet-500/20',
        category: 'content',
    },
    'content.text': {
        renderIcon: (cls = 'size-4') => <AlignLeft className={cls} />,
        textColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        category: 'content',
    },
    'content.richtext': {
        renderIcon: (cls = 'size-4') => <FileText className={cls} />,
        textColor: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        category: 'content',
    },
    'content.button': {
        renderIcon: (cls = 'size-4') => <RectangleHorizontal className={cls} />,
        textColor: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        category: 'content',
    },
    'content.link': {
        renderIcon: (cls = 'size-4') => <ExternalLink className={cls} />,
        textColor: 'text-sky-600 dark:text-sky-400',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/20',
        category: 'content',
    },
    'media.image': {
        renderIcon: (cls = 'size-4') => <Image className={cls} />,
        textColor: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/20',
        category: 'media',
    },
    'code.customcode': {
        renderIcon: (cls = 'size-4') => <Code2 className={cls} />,
        textColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        category: 'code',
    },
    'marketing.card': {
        renderIcon: (cls = 'size-4') => <SquareDashed className={cls} />,
        textColor: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        category: 'marketing',
    },
    'reusable.instance': {
        renderIcon: (cls = 'size-4') => <Sparkles className={cls} />,
        textColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        category: 'reusable',
    },
};

const DEFAULT_VISUAL = {
    renderIcon: (cls = 'size-4') => <Plus className={cls} />,
    textColor: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    category: 'other',
};

export function getComponentVisual(type: string): ComponentVisualInfo {
    const entry = VISUAL_REGISTRY[type] ?? DEFAULT_VISUAL;
    return {
        icon: (className) => entry.renderIcon(className),
        textColor: entry.textColor,
        bgColor: entry.bgColor,
        borderColor: entry.borderColor,
        category: entry.category,
    };
}

export function getComponentIcon(type: string, className = 'size-4'): ReactNode {
    return getComponentVisual(type).icon(className);
}

export function getCategoryBadge(category: string): { label: string; color: string } {
    switch (category.toLowerCase()) {
        case 'layout':
            return { label: 'Layout', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' };
        case 'content':
            return { label: 'Content', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' };
        case 'media':
            return { label: 'Media', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' };
        case 'code':
            return { label: 'Code', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
        case 'marketing':
            return { label: 'Marketing', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' };
        default:
            return { label: category.charAt(0).toUpperCase() + category.slice(1), color: 'bg-muted text-muted-foreground' };
    }
}
