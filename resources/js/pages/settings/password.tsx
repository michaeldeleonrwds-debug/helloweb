import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Check, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                        <HeadingSmall
                            title="Update Password"
                            description="Ensure your account is using a long, random password to stay secure."
                        />
                        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-primary text-xs font-semibold">
                            <ShieldCheck className="size-4 stroke-[2.2]" />
                            <span>Encrypted Storage</span>
                        </div>
                    </div>

                    <form onSubmit={updatePassword} className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <KeyRound className="size-3.5 text-muted-foreground" />
                                Current Password
                            </Label>

                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                className="h-10 rounded-xl"
                                autoComplete="current-password"
                                placeholder="Enter your current password"
                            />

                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Lock className="size-3.5 text-muted-foreground" />
                                New Password
                            </Label>

                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="h-10 rounded-xl"
                                autoComplete="new-password"
                                placeholder="Create a strong new password"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Lock className="size-3.5 text-muted-foreground" />
                                Confirm New Password
                            </Label>

                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="h-10 rounded-xl"
                                autoComplete="new-password"
                                placeholder="Re-type your new password"
                            />

                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <Button
                                disabled={processing}
                                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-6 shadow-xs transition active:scale-98"
                            >
                                {processing ? 'Updating...' : 'Update Password'}
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
                                    Password updated
                                </span>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
