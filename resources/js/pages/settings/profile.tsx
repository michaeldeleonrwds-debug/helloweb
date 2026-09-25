import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Check, Mail, User as UserIcon } from 'lucide-react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                        <HeadingSmall title="Profile Information" description="Update your account details and contact email address." />

                        {/* User Identity Chip */}
                        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-3.5 py-2">
                            <Avatar className="size-9 border border-border shadow-2xs">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-left text-xs leading-tight">
                                <div className="font-bold text-foreground truncate max-w-[130px]">{auth.user.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate max-w-[130px]">{auth.user.email}</div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <UserIcon className="size-3.5 text-muted-foreground" />
                                Full Name
                            </Label>

                            <Input
                                id="name"
                                className="h-10 rounded-xl"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="e.g. Michael de Leon"
                            />

                            <InputError className="mt-1" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Mail className="size-3.5 text-muted-foreground" />
                                Email Address
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                className="h-10 rounded-xl"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="e.g. name@example.com"
                            />

                            <InputError className="mt-1" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs">
                                <p className="text-amber-800 dark:text-amber-300">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="font-bold underline hover:opacity-80"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 font-semibold text-emerald-600 dark:text-emerald-400">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                            <Button
                                disabled={processing}
                                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-6 shadow-xs transition active:scale-98"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out duration-300"
                                enterFrom="opacity-0 translate-x-2"
                                leave="transition ease-in-out duration-300"
                                leaveTo="opacity-0"
                            >
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <Check className="size-3.5" />
                                    Saved successfully
                                </span>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
