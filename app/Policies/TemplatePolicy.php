<?php

namespace App\Policies;

use App\Models\Template;
use App\Models\User;

class TemplatePolicy
{
    public function view(User $user, Template $template): bool
    {
        return (int) $template->user_id === (int) $user->id;
    }

    public function update(User $user, Template $template): bool
    {
        return $this->view($user, $template);
    }

    public function instantiate(User $user, Template $template): bool
    {
        return $this->view($user, $template);
    }
}
