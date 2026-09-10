<?php

namespace Tests\Feature;

use App\Models\CabinetSession;
use App\Models\KnownPhone;
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

    public function test_issued_order_is_not_labelled_as_ready_for_pickup(): void
    {
        $token = str_repeat('h', 80);
        CabinetSession::query()->create([
            'token_hash' => hash('sha256', $token),
            'agbis_session' => 'AGBIS-SESSION',
            'contr_id' => '10012220',
            'phone' => '+79263314618',
            'last_seen_at' => now(),
            'expires_at' => now()->addDay(),
        ]);

        Http::fakeSequence()
            ->push(['error' => 0, 'orders' => [
                ['dor_id' => '1', 'doc_num' => 'A-1', 'status' => '3'],
            ]])
            ->push(['error' => 0, 'orders_history' => [
                ['dor_id' => '2', 'doc_num' => 'A-2', 'status' => '5'],
                ['dor_id' => '3', 'doc_num' => 'A-3', 'status' => '7'],
            ]])
            ->push(['error' => 0, 'Name' => rawurlencode('Максим')])
            ->push(['error' => 0, 'order_services' => []])
            ->push(['error' => 0, 'photos' => []]);

        $this->withToken($token)
            ->getJson('/api/v1/cabinet/dashboard')
            ->assertOk()
            ->assertJsonPath('orders.0.status.label', 'В работе')
            ->assertJsonPath('history.0.status.code', 'issued')
            ->assertJsonPath('history.0.status.label', 'Выдан')
            ->assertJsonPath('history.1.status.label', 'Отменён');
    }

    public function test_unavailable_agbis_is_not_shown_as_an_empty_cabinet(): void
    {
        $session = CabinetSession::query()->create([
            'token_hash' => hash('sha256', $token = str_repeat('t', 80)),
            'agbis_session' => 'AGBIS-SESSION',
            'contr_id' => '10012220',
            'phone' => '+79263314618',
            'last_seen_at' => now(),
            'expires_at' => now()->addDay(),
        ]);

        // AGBIS отдаёт отказ кодом внутри тела, HTTP при этом обычный 200.
        Http::fake(['*' => Http::response(['error' => 108, 'Msg' => 'Сервер недоступен!'])]);

        $this->withToken($token)
            ->getJson('/api/v1/cabinet/dashboard')
            ->assertStatus(503)
            ->assertJsonPath('message', 'Сервер недоступен!')
            ->assertJsonMissingPath('orders');

        $this->assertModelExists($session);
    }

    public function test_unknown_phone_is_reported_as_such(): void
    {
        $this->postJson('/api/v1/cabinet/check-phone', ['phone' => '+79990000000'])
            ->assertOk()
            ->assertJsonPath('known', false);
    }

    public function test_phone_is_remembered_when_the_code_is_sent_not_when_login_succeeds(): void
    {
        Http::fake([
            'https://himinfo.ru/*' => Http::response('PNG', 200, ['Set-Cookie' => 'CaptchaID=guid-1; Path=/']),
            'https://example.test/*' => Http::response(['error' => 0, 'Msg' => rawurlencode('Отправлено')]),
        ]);

        $this->postJson('/api/v1/cabinet/send-code', [
            'phone' => '+79263314618',
            'captcha_token' => $this->getJson('/api/v1/cabinet/captcha')->json('token'),
            'captcha_value' => 'аб12в',
            'mode' => 'register',
            'consent' => true,
        ])->assertOk();

        // Войти человек мог и не дойти — второй раз регистрацию не дёргаем.
        $this->postJson('/api/v1/cabinet/check-phone', ['phone' => '+79263314618'])
            ->assertJsonPath('known', true);
    }

    public function test_known_phones_are_stored_only_as_fingerprints(): void
    {
        Http::fake([
            'https://himinfo.ru/*' => Http::response('PNG', 200, ['Set-Cookie' => 'CaptchaID=guid-2; Path=/']),
            'https://example.test/*' => Http::response(['error' => 0, 'Msg' => rawurlencode('Отправлено')]),
        ]);

        $this->postJson('/api/v1/cabinet/send-code', [
            'phone' => '+79263314618',
            'captcha_token' => $this->getJson('/api/v1/cabinet/captcha')->json('token'),
            'captcha_value' => 'аб12в',
            'mode' => 'register',
            'consent' => true,
        ])->assertOk();

        $stored = KnownPhone::sole();

        $this->assertNotSame('+79263314618', $stored->phone_hash);
        $this->assertSame(64, strlen($stored->phone_hash));
        $this->assertDatabaseMissing('cabinet_known_phones', ['phone_hash' => '+79263314618']);
    }

    public function test_captcha_is_proxied_and_its_agbis_id_never_reaches_the_browser(): void
    {
        Http::fake([
            'https://himinfo.ru/*' => Http::response('PNG-BYTES', 200, [
                'Content-Type' => 'image/png',
                'Set-Cookie' => 'CaptchaID=server-guid-1234; Path=/',
            ]),
        ]);

        $response = $this->getJson('/api/v1/cabinet/captcha')->assertOk();

        $this->assertStringStartsWith('data:image/png;base64,', $response->json('image'));
        $this->assertSame('PNG-BYTES', base64_decode(explode(',', $response->json('image'))[1]));
        $response->assertJsonMissing(['id' => 'server-guid-1234']);
        $this->assertStringNotContainsString('server-guid-1234', $response->getContent());
    }

    public function test_send_code_passes_captcha_id_to_agbis_as_a_cookie(): void
    {
        Http::fake([
            'https://himinfo.ru/*' => Http::response('PNG', 200, ['Set-Cookie' => 'CaptchaID=guid-42; Path=/']),
            'https://example.test/*' => Http::response(['error' => 0, 'Msg' => rawurlencode('СМС сообщение с кодом отправлено')]),
        ]);

        $token = $this->getJson('/api/v1/cabinet/captcha')->json('token');

        $this->postJson('/api/v1/cabinet/send-code', [
            'phone' => '+79990000000',
            'captcha_token' => $token,
            'captcha_value' => 'аб12в',
            'mode' => 'register',
            'consent' => true,
        ])->assertOk()->assertJsonPath('state', 'sent');

        Http::assertSent(fn ($request): bool => str_contains($request->url(), 'ModernRegistrationVerified=')
            && str_contains($request->url(), 'CaptchaValue=')
            && str_contains($request->header('Cookie')[0] ?? '', 'CaptchaID=guid-42'));
    }

    public function test_used_captcha_token_cannot_be_replayed(): void
    {
        Http::fake([
            'https://himinfo.ru/*' => Http::response('PNG', 200, ['Set-Cookie' => 'CaptchaID=guid-99; Path=/']),
            'https://example.test/*' => Http::response(['error' => 0, 'Msg' => rawurlencode('Отправлено')]),
        ]);

        $token = $this->getJson('/api/v1/cabinet/captcha')->json('token');
        $payload = [
            'phone' => '+79990000000',
            'captcha_token' => $token,
            'captcha_value' => 'аб12в',
            'mode' => 'register',
            'consent' => true,
        ];

        $this->postJson('/api/v1/cabinet/send-code', $payload)->assertOk();
        $this->postJson('/api/v1/cabinet/send-code', $payload)
            ->assertStatus(422)
            ->assertJsonPath('retry_captcha', true);
    }

    public function test_registration_refusal_from_agbis_is_shown_to_the_client(): void
    {
        Http::fake([
            'https://himinfo.ru/*' => Http::response('PNG', 200, ['Set-Cookie' => 'CaptchaID=guid-7; Path=/']),
            'https://example.test/*' => Http::response([
                'error' => 403,
                'Msg' => 'Этот способ регистрации отключён',
            ], 403),
        ]);

        $token = $this->getJson('/api/v1/cabinet/captcha')->json('token');

        $this->postJson('/api/v1/cabinet/send-code', [
            'phone' => '+79990000000',
            'captcha_token' => $token,
            'captcha_value' => 'аб12в',
            'mode' => 'register',
            'consent' => true,
        ])->assertStatus(422)
            ->assertJsonPath('message', 'Этот способ регистрации отключён');
    }

    public function test_known_phone_is_told_it_already_has_a_password(): void
    {
        Http::fake([
            'https://himinfo.ru/*' => Http::response('PNG', 200, ['Set-Cookie' => 'CaptchaID=guid-8; Path=/']),
            'https://example.test/*' => Http::response([
                'error' => 1,
                'Msg' => rawurlencode('Данный номер телефона уже зарегистрирован'),
                'contr_id' => '10012220',
                'exists' => '1',
            ]),
        ]);

        $token = $this->getJson('/api/v1/cabinet/captcha')->json('token');

        $this->postJson('/api/v1/cabinet/send-code', [
            'phone' => '+79263314618',
            'captcha_token' => $token,
            'captcha_value' => 'аб12в',
            'mode' => 'register',
            'consent' => true,
        ])->assertOk()
            ->assertJsonPath('state', 'has_password')
            ->assertJsonMissing(['contr_id' => '10012220']);
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
