<?php

namespace Tests\Feature;

use App\Mail\OrderStatusChanged;
use App\Models\CabinetPreference;
use App\Models\CabinetSession;
use App\Services\OrderChangeMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CabinetNotificationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['agbis.base_url' => 'https://example.test/api/']);
    }

    private function subscriber(array $state): CabinetPreference
    {
        CabinetSession::query()->create([
            'token_hash' => hash('sha256', 'token'),
            'agbis_session' => 'AGBIS-SESSION',
            'contr_id' => '10012220',
            'phone' => '+79263314618',
            'last_seen_at' => now(),
            'expires_at' => now()->addDay(),
        ]);

        return CabinetPreference::query()->create([
            'contr_id' => '10012220',
            'email' => 'client@example.com',
            'email_notifications' => true,
            'push_notifications' => false,
            'last_orders_state' => $state,
        ]);
    }

    public function test_unavailable_agbis_does_not_look_like_orders_disappearing(): void
    {
        $known = ['500' => ['number' => '000987-2', 'ready' => false, 'ready_at' => '04.09.2026 18:00']];
        $preference = $this->subscriber($known);

        // Выключенный компьютер химчистки: HTTP 200, отказ кодом внутри тела.
        Http::fake(['*' => Http::response(['error' => 108, 'Msg' => 'Сервер недоступен!'])]);
        Mail::fake();

        $this->artisan('cabinet:check-orders')->assertSuccessful();

        Mail::assertNothingSent();
        $this->assertSame($known, $preference->fresh()->last_orders_state);
    }

    public function test_ready_order_is_announced_by_number(): void
    {
        $this->subscriber(['500' => ['number' => '000987-2', 'ready' => false, 'ready_at' => '04.09.2026 18:00']]);

        Http::fake(['*' => Http::response(['error' => 0, 'orders' => [
            ['dor_id' => '500', 'doc_num' => '000987-2', 'status' => '4', 'date_out' => '04.09.2026 18:00'],
        ]])]);
        Mail::fake();

        $this->artisan('cabinet:check-orders')->assertSuccessful();

        Mail::assertSent(OrderStatusChanged::class, function (OrderStatusChanged $mail): bool {
            return $mail->heading === 'Заказ № 000987-2 готов'
                && $mail->hasTo('client@example.com');
        });
    }

    public function test_first_pass_only_remembers_and_stays_silent(): void
    {
        $preference = $this->subscriber([]);
        $preference->forceFill(['last_orders_state' => null])->save();

        Http::fake(['*' => Http::response(['error' => 0, 'orders' => [
            ['dor_id' => '500', 'doc_num' => '000987-2', 'status' => '4', 'date_out' => ''],
        ]])]);
        Mail::fake();

        $this->artisan('cabinet:check-orders')->assertSuccessful();

        Mail::assertNothingSent();
        $this->assertArrayHasKey('500', $preference->fresh()->last_orders_state);
    }

    public function test_unchanged_orders_say_nothing(): void
    {
        $state = ['500' => ['number' => '000987-2', 'ready' => false, 'ready_at' => '04.09.2026 18:00']];
        $this->subscriber($state);

        Http::fake(['*' => Http::response(['error' => 0, 'orders' => [
            ['dor_id' => '500', 'doc_num' => '000987-2', 'status' => '1', 'date_out' => '04.09.2026 18:00'],
        ]])]);
        Mail::fake();

        $this->artisan('cabinet:check-orders')->assertSuccessful();

        Mail::assertNothingSent();
    }

    public function test_issued_order_leaving_the_list_is_not_announced(): void
    {
        $this->subscriber(['500' => ['number' => '000987-2', 'ready' => true, 'ready_at' => '']]);

        Http::fake(['*' => Http::response(['error' => 0, 'orders' => []])]);
        Mail::fake();

        $this->artisan('cabinet:check-orders')->assertSuccessful();

        Mail::assertNothingSent();
    }

    public function test_new_order_is_announced_as_accepted(): void
    {
        $this->subscriber([]);

        Http::fake(['*' => Http::response(['error' => 0, 'orders' => [
            ['dor_id' => '700', 'doc_num' => '001001-1', 'status' => '1', 'date_out' => '12.09.2026 18:00'],
        ]])]);
        Mail::fake();

        $this->artisan('cabinet:check-orders')->assertSuccessful();

        Mail::assertSent(OrderStatusChanged::class, fn (OrderStatusChanged $mail): bool => $mail->heading === 'Заказ № 001001-1 принят');
    }

    public function test_several_ready_orders_are_listed_in_one_message(): void
    {
        $message = OrderChangeMessage::between(
            [
                '1' => ['number' => 'A-1', 'ready' => false, 'ready_at' => ''],
                '2' => ['number' => 'A-2', 'ready' => false, 'ready_at' => ''],
            ],
            [
                '1' => ['number' => 'A-1', 'ready' => true, 'ready_at' => ''],
                '2' => ['number' => 'A-2', 'ready' => true, 'ready_at' => ''],
            ],
        );

        $this->assertSame('Готовы заказы: № A-1, № A-2', $message['title']);
    }

    public function test_new_ready_date_is_reported(): void
    {
        $message = OrderChangeMessage::between(
            ['1' => ['number' => 'A-1', 'ready' => false, 'ready_at' => '04.09.2026 18:00']],
            ['1' => ['number' => 'A-1', 'ready' => false, 'ready_at' => '06.09.2026 18:00']],
        );

        $this->assertSame('Изменился срок по заказу № A-1', $message['title']);
        $this->assertStringContainsString('06.09.2026 18:00', $message['body']);
    }
}
