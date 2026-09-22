<?php

namespace App\Policies;

use App\Models\Page;
use App\Models\User;

class PagePolicy
{
    public function view(User $user, Page $page): bool
    {
        return $page->website()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Page $page): bool
    {
        return $this->view($user, $page);
    }

    public function revisions(User $user, Page $page): bool
    {
        return $this->view($user, $page);
    }
}
