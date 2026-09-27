<?php

namespace App\Policies;

use App\Models\Template;
use App\Models\User;

class TemplatePolicy
{
    public function view(User $user, Template $template): bool
    {
        return (int) $template->user_id === (int) $user->id || (bool) $template->is_platform || $user->isSuperAdmin();
    }

    public function update(User $user, Template $template): bool
    {
        if ($template->is_platform) {
            return true; // regular users can customize/fork, superadmins can edit
        }

        return (int) $template->user_id === (int) $user->id || $user->isSuperAdmin();
    }

    public function instantiate(User $user, Template $template): bool
    {
        return (int) $template->user_id === (int) $user->id || (bool) $template->is_platform || $user->isSuperAdmin();
    }

    public function delete(User $user, Template $template): bool
    {
        if ($template->is_platform) {
            return $user->isSuperAdmin();
        }

        return (int) $template->user_id === (int) $user->id || $user->isSuperAdmin();
    }
}
