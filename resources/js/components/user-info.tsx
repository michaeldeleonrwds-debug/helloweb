import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="size-8.5 overflow-hidden rounded-full border border-neutral-200 shadow-2xs">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-bold text-foreground">{user.name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-[11px] font-normal">{user.email}</span>}
            </div>
        </>
    );
}
