export type TreeInsertPosition = { mode: 'append' } | { mode: 'before'; siblingId: string } | { mode: 'after'; siblingId: string };

export const appendPosition = (): TreeInsertPosition => ({ mode: 'append' });

export const beforePosition = (siblingId: string): TreeInsertPosition => ({
    mode: 'before',
    siblingId,
});

export const afterPosition = (siblingId: string): TreeInsertPosition => ({
    mode: 'after',
    siblingId,
});
