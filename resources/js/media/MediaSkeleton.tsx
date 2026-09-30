import { cn } from '@/lib/utils';

export function MediaGridSkeleton({ count = 10, className }: { count?: number; className?: string }) {
    return (
        <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5', className)} aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-border/60 bg-card">
                    <div className="bg-muted/70 aspect-square animate-pulse" />
                    <div className="space-y-1.5 px-2 py-2">
                        <div className="bg-muted/70 h-2.5 w-3/4 animate-pulse rounded" />
                        <div className="bg-muted/50 h-2 w-1/2 animate-pulse rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function MediaListSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="divide-border/50 overflow-hidden rounded-xl border border-border bg-card" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex items-center gap-3 border-b border-border/40 px-3 py-2 last:border-b-0">
                    <div className="bg-muted/70 size-8 shrink-0 animate-pulse rounded-md" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="bg-muted/70 h-2.5 w-1/3 animate-pulse rounded" />
                        <div className="bg-muted/50 h-2 w-1/5 animate-pulse rounded" />
                    </div>
                    <div className="bg-muted/50 hidden h-2 w-16 animate-pulse rounded sm:block" />
                    <div className="bg-muted/50 hidden h-2 w-16 animate-pulse rounded sm:block" />
                </div>
            ))}
        </div>
    );
}

export function FolderListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="space-y-0.5" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex h-8 items-center gap-1.5 rounded-md px-2">
                    <div className="bg-muted/70 size-3.5 shrink-0 animate-pulse rounded" />
                    <div className="bg-muted/60 h-2.5 animate-pulse rounded" style={{ width: `${45 + ((index * 13) % 40)}%` }} />
                </div>
            ))}
        </div>
    );
}
