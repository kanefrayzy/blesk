<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_sends_an_editor_to_the_panel(): void
    {
        $this->get('/')->assertRedirect('/'.config('panel.path'));
    }

    public function test_panel_requires_authentication(): void
    {
        $path = config('panel.path');

        $this->get("/{$path}")->assertRedirect("/{$path}/login");
    }

    public function test_login_page_is_reachable(): void
    {
        $this->get('/'.config('panel.path').'/login')->assertOk();
    }

    public function test_signed_in_editor_sees_the_posts_list(): void
    {
        $this->actingAs(User::factory()->editor()->create())
            ->get('/'.config('panel.path').'/posts')
            ->assertOk();
    }

    public function test_backend_answers_are_closed_from_search_engines(): void
    {
        $this->get('/'.config('panel.path').'/login')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

        $this->getJson('/api/v1/posts')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }

    public function test_user_without_editor_rights_is_kept_out(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/'.config('panel.path'))
            ->assertForbidden();
    }
}
