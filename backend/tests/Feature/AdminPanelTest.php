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
        $this->get('/')->assertRedirect('/admin');
    }

    public function test_panel_requires_authentication(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
    }

    public function test_login_page_is_reachable(): void
    {
        $this->get('/admin/login')->assertOk();
    }

    public function test_signed_in_editor_sees_the_posts_list(): void
    {
        $this->actingAs(User::factory()->editor()->create())
            ->get('/admin/posts')
            ->assertOk();
    }

    public function test_user_without_editor_rights_is_kept_out(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/admin')
            ->assertForbidden();
    }
}
