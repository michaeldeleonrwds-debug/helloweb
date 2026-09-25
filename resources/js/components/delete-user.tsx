import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

// Components...
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import HeadingSmall from '@/components/heading-small';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-4 pt-6 border-t border-border">
            <HeadingSmall title="Delete account" description="Permanently delete your account and remove all associated data and websites." />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 dark:border-destructive/30 dark:bg-destructive/10">
                <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive dark:bg-destructive/20">
                        <AlertTriangle className="size-4.5 stroke-[2.2]" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">Danger Zone</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Once your account is deleted, all resources and data are permanently wiped. This action cannot be undone.
                        </p>
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="shrink-0 rounded-full font-bold text-xs h-9 px-5 shadow-xs">
                            Delete Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-2xl">
                        <DialogTitle className="text-base font-bold">Are you sure you want to delete your account?</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            Once your account is deleted, all of its websites, pages, and data will be permanently removed. Please enter your password to confirm.
                        </DialogDescription>
                        <form className="space-y-4" onSubmit={deleteUser}>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-xs font-semibold">
                                    Confirm Password
                                </Label>

                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your account password"
                                    autoComplete="current-password"
                                    className="h-10 rounded-xl"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal} className="rounded-full text-xs font-semibold">
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button variant="destructive" disabled={processing} type="submit" className="rounded-full text-xs font-bold">
                                    {processing ? 'Deleting...' : 'Permanently Delete'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
