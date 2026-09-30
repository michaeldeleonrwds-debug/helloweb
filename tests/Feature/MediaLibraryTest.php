<?php

namespace Tests\Feature;

use App\Builder\Media\MediaAssetService;
use App\Builder\Media\MediaFolderService;
use App\Models\MediaAsset;
use App\Models\MediaFolder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class MediaLibraryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_folder_tree_can_be_built_from_nested_folders(): void
    {
        $user = User::factory()->create();
        $parent = (new MediaFolderService)->create($user, null, 'Brand');
        $child = (new MediaFolderService)->create($user, $parent, 'Logos');

        $tree = (new MediaFolderService)->tree($user);

        $this->assertCount(1, $tree);
        $this->assertSame($parent->id, $tree[0]['id']);
        $this->assertSame('Brand', $tree[0]['name']);
        $this->assertCount(1, $tree[0]['children']);
        $this->assertSame($child->id, $tree[0]['children'][0]['id']);
        $this->assertSame($parent->id, $tree[0]['children'][0]['parentId']);
    }

    public function test_a_folder_cannot_be_moved_into_itself_or_its_own_descendant(): void
    {
        $user = User::factory()->create();
        $service = new MediaFolderService;
        $parent = $service->create($user, null, 'Parent');
        $child = $service->create($user, $parent, 'Child');

        $this->expectException(ValidationException::class);
        $service->move($user, $parent, $child);
    }

    public function test_a_folder_name_must_be_unique_among_siblings(): void
    {
        $user = User::factory()->create();
        $service = new MediaFolderService;
        $service->create($user, null, 'Shared');

        $this->expectException(ValidationException::class);
        $service->create($user, null, 'Shared');
    }

    public function test_assets_fall_back_to_the_library_root_when_their_folder_is_deleted(): void
    {
        $user = User::factory()->create();
        $service = new MediaFolderService;
        $folder = $service->create($user, null, 'Temporary');
        $asset = $this->asset($user, $folder);

        $service->delete($user, $folder);

        $this->assertNull($asset->fresh()->folder_id);
    }

    public function test_deleting_a_folder_rejects_users_who_do_not_own_it(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $folder = (new MediaFolderService)->create($owner, null, 'Private');

        $this->expectException(HttpException::class);
        (new MediaFolderService)->delete($intruder, $folder);
    }

    public function test_a_moved_asset_reports_its_new_folder_in_the_index(): void
    {
        $user = User::factory()->create();
        $service = new MediaFolderService;
        $folder = $service->create($user, null, 'Screenshots');
        $asset = $this->asset($user);

        $response = $this->actingAs($user)
            ->patchJson(route('builder.media.update', $asset->id), ['folder_id' => $folder->id]);

        $response->assertOk()
            ->assertJsonPath('media.folderId', $folder->id);

        $this->assertSame($folder->id, $asset->fresh()->folder_id);
    }

    public function test_an_asset_can_be_moved_back_to_the_library_root(): void
    {
        $user = User::factory()->create();
        $folder = (new MediaFolderService)->create($user, null, 'Rooted');
        $asset = $this->asset($user, $folder);

        $this->actingAs($user)
            ->patchJson(route('builder.media.update', $asset->id), ['folder_id' => null])
            ->assertOk()
            ->assertJsonPath('media.folderId', null);

        $this->assertNull($asset->fresh()->folder_id);
    }

    public function test_an_asset_cannot_be_placed_in_a_folder_owned_by_another_user(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $folder = (new MediaFolderService)->create($owner, null, 'Owner folder');
        $asset = $this->asset($intruder);

        $this->actingAs($intruder)
            ->patchJson(route('builder.media.update', $asset->id), ['folder_id' => $folder->id])
            ->assertStatus(422);

        $this->assertNull($asset->fresh()->folder_id);
    }

    public function test_assets_and_folders_belonging_to_another_user_are_rejected(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $folder = (new MediaFolderService)->create($owner, null, 'Private');
        $asset = $this->asset($owner, $folder);

        $this->actingAs($intruder)
            ->patchJson(route('builder.media.folders.update', $folder->id), ['name' => 'Renamed'])
            ->assertForbidden();

        $this->actingAs($intruder)
            ->patchJson(route('builder.media.update', $asset->id), ['original_filename' => 'stolen.png'])
            ->assertForbidden();

        $this->actingAs($intruder)
            ->deleteJson(route('builder.media.destroy', $asset->id))
            ->assertForbidden();

        $this->assertSame('Private', $folder->fresh()->name);
        $this->assertSame('photo.png', $asset->fresh()->original_filename);
    }

    public function test_archived_assets_are_hidden_from_the_active_index_but_listed_under_status_all(): void
    {
        $user = User::factory()->create();
        $asset = $this->asset($user);

        $this->actingAs($user)
            ->postJson(route('builder.media.archive', $asset->id))
            ->assertOk();

        $active = $this->actingAs($user)
            ->getJson(route('builder.media.index', ['status' => 'active']))
            ->assertOk()
            ->json('media');

        $all = $this->actingAs($user)
            ->getJson(route('builder.media.index', ['status' => 'all']))
            ->assertOk()
            ->json('media');

        $this->assertSame([], collect($active)->pluck('id')->all());
        $this->assertSame([$asset->id], collect($all)->pluck('id')->all());
        $this->assertSame('archived', collect($all)->firstWhere('id', $asset->id)['status']);
    }

    public function test_an_archived_asset_can_be_restored_or_permanently_deleted(): void
    {
        $user = User::factory()->create();
        $asset = $this->asset($user);

        $this->actingAs($user)->postJson(route('builder.media.archive', $asset->id))->assertOk();
        $this->assertSame('archived', $asset->fresh()->status);

        $this->actingAs($user)->postJson(route('builder.media.restore', $asset->id))->assertOk();
        $this->assertSame('active', $asset->fresh()->status);

        $this->actingAs($user)->deleteJson(route('builder.media.destroy', $asset->id))->assertOk();
        $this->assertNull(MediaAsset::find($asset->id));
    }

    public function test_a_new_asset_can_be_uploaded_into_a_folder(): void
    {
        $user = User::factory()->create();
        $folder = (new MediaFolderService)->create($user, null, 'Uploads');

        $response = $this->actingAs($user)->postJson(route('builder.media.store'), [
            'file' => UploadedFile::fake()->create('hero.png', 12, 'image/png'),
            'folder_id' => $folder->id,
        ]);

        $response->assertCreated();

        $asset = MediaAsset::findOrFail($response->json('media.id'));
        $this->assertSame($folder->id, $asset->folder_id);
        $this->assertSame($user->id, $asset->user_id);
    }

    private function asset(User $user, ?MediaFolder $folder = null): MediaAsset
    {
        return app(MediaAssetService::class)->store($user, 'photo.png', 'image/png', 'binary-image', [], $folder);
    }
}
