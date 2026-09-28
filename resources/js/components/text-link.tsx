import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof Link>;

export default function TextLink({ className = '', children, ...props }: LinkProps) {
    return (
        <Link
            className={cn(
                'text-primary font-semibold underline-offset-4 hover:underline transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xs',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
