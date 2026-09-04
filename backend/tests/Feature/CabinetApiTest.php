<?php

namespace Tests\Feature;

use App\Models\CabinetSession;
use App\Models\PushSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CabinetApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['agbis.base_url' => 'https://example.test/api/']);
    }

    public function test_existing_phone_moves_to_password_without_exposing_agbis_data(): void
    {
        Http::fake([
            '*' => Http::response([
                'error' => 1,
                'Msg' => rawurlencode('Данный номер телефона уже зарегистрирован'),
                'contr_id' => '10012220',
                'exists' => '1',
            ]),
        ]);

        $this->postJson('/api/v1/cabinet/identify', [
            'phone' => '+79263314618',
            'consent' => true,
        ])->assertOk()
            ->assertJsonPath('state', 'password')
            ->assertJsonMissing(['contr_id' => '10012220']);
    }

    public function test_new_phone_receives_sms_password_step(): void
    {
        Http::fake(['*' => Http::response(['error' => 0, 'Msg' => rawurlencode('СМС сообщение с кодом отправлено')])]);

        $this->postJson('/api/v1/cabinet/identify', [
            'phone' => '+79990000000',
            'consent' => true,
        ])->assertOk()
            ->assertJsonPath('state', 'password')
            ->assertJsonPath('is_new', true);

        Http::assertSent(fn ($request): bool => str_contains($request->url(), 'ModernRegistration='));
    }

    public function test_login_stores_only_hashed_browser_token_and_encrypted_agbis_session(): void
    {
        Http::fake(['*' => Http::response([
            'error' => 0,
            'Session_id' => 'AGBIS-PRIVATE-SESSION',
            'contr_id' => '10012220',
            'promo_code_friend' => '',
        ])]);

        $response = $this->postJson('/api/v1/cabinet/login', [
            'phone' => '+79263314618',
            'password' => '123456',
        ]);

        $response->assertOk()->assertCookie(config('agbis.cookie'));
        $session = CabinetSession::query()->firstOrFail();
        $this->assertSame('AGBIS-PRIVATE-SESSION', $session->agbis_session);
        $this->assertStringNotContainsString('AGBIS-PRIVATE-SESSION', (string) $session->getRawOriginal('agbis_session'));
        $this->assertSame(64, strlen($session->token_hash));

        Http::assertSent(function ($request): bool {
            parse_str(parse_url($request->url(), PHP_URL_QUERY) ?: '', $query);
            $payload = json_decode($query['ModernLogin'] ?? '{}', true);

            return ($payload['pwd'] ?? '') === sha1('123456')
                && ! str_contains($request->url(), '123456');
        });
    }

    public function test_dashboard_maps_real_order_shape_and_hides_internal_fields(): void
    {
        $token = str_repeat('a', 80);
        CabinetSession::query()->create([
            'token_hash' => hash('sha256', $token),
            'agbis_session' => 'AGBIS-SESSION',
            'contr_id' => '10012220',
            'phone' => '+79263314618',
            'last_seen_at' => now(),
            'expires_at' => now()->addDay(),
        ]);

        Http::fakeSequence()
            ->push(['error' => 0, 'orders' => [[
                'dor_id' => '10038180', 'doc_num' => '000987-2', 'doc_date' => '01.09.2026',
                'date_out' => '04.09.2026 18:00', 'status' => '1', 'photo_exist' => '1',
            ]]])
            ->push(['error' => 0, 'orders_history' => []])
            ->push(['error' => 0, 'Name' => rawurlencode('Максим')])
            ->push(['error' => 0, 'order_services' => [[
                'dos_id' => '11', 'name' => rawurlencode('А Пиджак'), 'status_name' => rawurlencode('Новый'),
                'kredit' => '1500', 'barcode' => 'SECRET-BARCODE', 'shop_description' => 'SECRET-COMMENT',
                'addons' => [['descr' => rawurlencode('Износ'), 'aos_value' => rawurlencode('20%')]],
            ]]])
            ->push(['error' => 0, 'photos' => [['dos_id' => '11', 'photo_id' => '42']]]);

        $response = $this->withToken($token)
            ->getJson('/api/v1/cabinet/dashboard');

        $response->assertOk()
            ->assertJsonPath('profile.name', 'Максим')
            ->assertJsonPath('orders.0.items.0.name', 'Пиджак')
            ->assertJsonPath('orders.0.items.0.status.label', 'Вещь в работе')
            ->assertJsonPath('orders.0.items.0.photos.0.id', '42');

        $this->assertStringNotContainsString('SECRET-BARCODE', $response->getContent());
        $this->assertStringNotContainsString('SECRET-COMMENT', $response->getContent());
    }

    public function test_authenticated_client_can_store_encrypted_push_subscription(): void
    {
        $token = str_repeat('b', 80);
        CabinetSession::query()->create([
            'token_hash' => hash('sha256', $token),
            'agbis_session' => 'AGBIS-SESSION',
            'contr_id' => '10012220',
            'phone' => '+79263314618',
            'last_seen_at' => now(),
            'expires_at' => now()->addDay(),
        ]);

        $endpoint = 'https://push.example.test/send/secret-device';
        $this->withToken($token)->postJson('/api/v1/cabinet/push/subscriptions', [
            'endpoint' => $endpoint,
            'keys' => ['p256dh' => 'public-key', 'auth' => 'auth-token'],
            'content_encoding' => 'aes128gcm',
        ])->assertCreated();

        $subscription = PushSubscription::query()->firstOrFail();
        $this->assertSame($endpoint, $subscription->endpoint);
        $this->assertStringNotContainsString($endpoint, (string) $subscription->getRawOriginal('endpoint'));
        $this->assertSame(hash('sha256', $endpoint), $subscription->endpoint_hash);
    }
}
