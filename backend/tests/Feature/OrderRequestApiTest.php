<?php

namespace Tests\Feature;

use App\Mail\OrderRequestReceived;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderRequestApiTest extends TestCase
{
    public function test_valid_order_request_is_sent_to_manager(): void
    {
        Mail::fake();
        config(['orders.recipient' => 'manager@example.test']);

        $response = $this->postJson('/api/v1/order-requests', $this->validPayload());

        $response->assertCreated()->assertJsonPath('message', 'Заявка принята.');

        Mail::assertSent(OrderRequestReceived::class, function (OrderRequestReceived $mail): bool {
            return $mail->hasTo('manager@example.test')
                && $mail->order['service'] === 'Пальто'
                && $mail->order['urgency'] === 'urgent_24h';
        });
    }

    public function test_contact_and_order_fields_are_required(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/order-requests', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name',
                'phone',
                'email',
                'service',
                'urgency',
                'contamination_level',
                'contamination_types',
                'consent',
            ]);

        Mail::assertNothingSent();
    }

    public function test_honeypot_accepts_request_without_sending_mail(): void
    {
        Mail::fake();
        $payload = $this->validPayload();
        $payload['website'] = 'https://spam.example';

        $this->postJson('/api/v1/order-requests', $payload)->assertCreated();

        Mail::assertNothingSent();
    }

    private function validPayload(): array
    {
        return [
            'name' => 'Анна',
            'phone' => '+7 (916) 000-00-00',
            'email' => 'anna@example.test',
            'service' => 'Пальто',
            'urgency' => 'urgent_24h',
            'contamination_level' => 'heavy',
            'contamination_types' => ['Кофе или чай'],
            'description' => 'Пятно на рукаве',
            'consent' => true,
            'website' => '',
            'page_url' => 'https://bleskvip.ru/?utm_source=yandex',
            'utm_source' => 'yandex',
            'utm_campaign' => 'search',
            'yclid' => '123456',
        ];
    }
}
