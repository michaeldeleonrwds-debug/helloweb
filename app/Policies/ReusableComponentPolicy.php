<?php

namespace App\Policies;

use App\Models\ReusableComponent;
use App\Models\User;

class ReusableComponentPolicy
{
    public function view(User $user, ReusableComponent $component): bool
    {
        return (int) $component->user_id === (int) $user->id;
    }

    public function update(User $user, ReusableComponent $component): bool
    {
        return $this->view($user, $component);
    }

    public function insert(User $user, ReusableComponent $component): bool
    {
        return $this->view($user, $component);
    }
}
