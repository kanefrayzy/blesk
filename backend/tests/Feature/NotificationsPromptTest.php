<?php

namespace Tests\Feature;

use App\Models\CabinetPreference;
use App\Models\CabinetSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationsPromptTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(): string
    {
        CabinetSession::query()->create([
            'token_hash' => hash('sha256', $token = str_repeat('p', 80)),
            'agbis_session' => 'AGBIS-SESSION',
            'contr_id' => '10012220',
            'phone' => '+79263314618',
            'last_seen_at' => now(),
            'expires_at' => now()->addDay(),
        ]);

        return $token;
    }

    public function test_client_without_notifications_is_offered_them(): void
    {
        $preference = CabinetPreference::query()->create(['contr_id' => '10012220']);

        $this->assertTrue($preference->shouldOfferNotifications());
    }

    public function test_client_with_any_channel_enabled_is_not_offered_again(): void
    {
        $push = CabinetPreference::query()->create(['contr_id' => '1', 'push_notifications' => true]);
        $email = CabinetPreference::query()->create(['contr_id' => '2', 'email_notifications' => true, 'email' => 'a@b.ru']);

        $this->assertFalse($push->shouldOfferNotifications());
        $this->assertFalse($email->shouldOfferNotifications());
    }

    public function test_not_now_hides_the_offer_across_devices(): void
    {
        $token = $this->signIn();

        $this->withToken($token)
            ->postJson('/api/v1/cabinet/notifications-prompt/dismiss')
            ->assertOk();

        $preference = CabinetPreference::query()->where('contr_id', '10012220')->sole();

        $this->assertNotNull($preference->notifications_prompt_dismissed_at);
        $this->assertFalse($preference->shouldOfferNotifications());
    }

    public function test_offer_comes_back_after_the_pause(): void
    {
        $preference = CabinetPreference::query()->create([
            'contr_id' => '10012220',
            'notifications_prompt_dismissed_at' => now()->subDays(CabinetPreference::PROMPT_PAUSE_DAYS + 1),
        ]);

        $this->assertTrue($preference->shouldOfferNotifications());
    }

    public function test_dismiss_requires_a_session(): void
    {
        $this->postJson('/api/v1/cabinet/notifications-prompt/dismiss')->assertUnauthorized();
    }
}
