<?php

namespace App\Policies;

use App\Models\ReusableComponent;
use App\Models\User;

class ReusableComponentPolicy
{
    public function view(User $user, ReusableComponent $component): bool
    {
        return (int) $component->user_id === (int) $user->id || (bool) $component->is_platform || $user->isSuperAdmin();
    }

    public function update(User $user, ReusableComponent $component): bool
    {
        if ($component->is_platform) {
            return $user->isSuperAdmin();
        }

        return (int) $component->user_id === (int) $user->id || $user->isSuperAdmin();
    }

    public function insert(User $user, ReusableComponent $component): bool
    {
        return (int) $component->user_id === (int) $user->id || (bool) $component->is_platform || $user->isSuperAdmin();
    }

    public function delete(User $user, ReusableComponent $component): bool
    {
        if ($component->is_platform) {
            return $user->isSuperAdmin();
        }

        return (int) $component->user_id === (int) $user->id || $user->isSuperAdmin();
    }
}
