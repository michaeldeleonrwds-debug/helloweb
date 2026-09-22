<?php

namespace App\Policies;

use App\Models\MediaAsset;
use App\Models\User;

class MediaAssetPolicy
{
    public function view(User $user, MediaAsset $asset): bool
    {
        return (int) $asset->user_id === (int) $user->id;
    }

    public function update(User $user, MediaAsset $asset): bool
    {
        return $this->view($user, $asset);
    }

    public function delete(User $user, MediaAsset $asset): bool
    {
        return $this->view($user, $asset);
    }
}
