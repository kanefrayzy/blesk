<?php

namespace App\Services;

use App\Exceptions\AgbisException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class AgbisClient
{
    public function modernRegistration(string $phone): array
    {
        return $this->json('ModernRegistration', [
            'phone' => $phone,
            'agree_to_receive_sms' => '1',
            'agree_to_receive_adv_sms' => '0',
            'agree_sms_order_reps' => '1',
            'registered_from' => '4',
        ]);
    }

    public function modernLogin(string $phone, string $password): array
    {
        return $this->json('ModernLogin', [
            'phone' => $phone,
            'pwd' => sha1($password),
        ]);
    }

    public function rememberPassword(string $phone): array
    {
        return $this->json('ModernRememberPwd', ['phone' => $phone]);
    }

    public function logout(string $sessionId): void
    {
        $this->json('Logout', null, $sessionId);
    }

    public function validSession(string $sessionId): array
    {
        return $this->json('ValidSessionID', null, $sessionId);
    }

    public function contrInfo(string $sessionId): array
    {
        return $this->json('ContrInfo', null, $sessionId);
    }

    public function orders(string $sessionId): array
    {
        return $this->json('Orders', null, $sessionId);
    }

    public function ordersHistory(string $sessionId): array
    {
        return $this->json('OrdersHistory', ['mon' => 2, 'sclad' => 1, 'need_serv' => 1], $sessionId);
    }

    public function fullOrderInfo(string $sessionId, string $orderId): array
    {
        return $this->json('FullOrderInfo', ['dor_id' => $orderId], $sessionId);
    }

    public function orderImages(string $sessionId, string $orderId): array
    {
        return $this->json('OrderImagesModern', ['dor_id' => $orderId, 'only_photo_id' => 1], $sessionId);
    }

    public function photo(string $sessionId, string $photoId, string $serviceId): Response
    {
        return $this->request('PhotoOnline', ['photo_id' => $photoId, 'dos_id' => $serviceId], $sessionId);
    }

    private function json(string $command, ?array $payload = null, ?string $sessionId = null): array
    {
        $response = $this->request($command, $payload, $sessionId);
        $data = $response->json();

        if (! is_array($data)) {
            throw new AgbisException;
        }

        return $this->decode($data);
    }

    private function request(string $command, ?array $payload = null, ?string $sessionId = null): Response
    {
        $baseUrl = rtrim((string) config('agbis.base_url'), '/');

        if ($baseUrl === '') {
            throw new AgbisException('Личный кабинет ещё не подключён к системе заказов.');
        }

        $query = $payload === null ? [$command => ''] : [
            $command => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
        ];

        if ($sessionId !== null) {
            $query['SessionID'] = $sessionId;
        }

        try {
            $client = Http::acceptJson();

            // Локальный PHP на Windows может не видеть системное хранилище корневых сертификатов.
            // На production проверка TLS всегда остаётся включённой.
            if (app()->isLocal()) {
                $client = $client->withoutVerifying();
            }

            $response = $client
                ->timeout(config('agbis.timeout'))
                ->connectTimeout(5)
                ->retry(2, 200, throw: false)
                ->get($baseUrl, $query);
        } catch (ConnectionException) {
            throw new AgbisException;
        }

        if (! $response->successful()) {
            throw new AgbisException;
        }

        return $response;
    }

    private function decode(mixed $value): mixed
    {
        if (is_array($value)) {
            return array_map(fn (mixed $item): mixed => $this->decode($item), $value);
        }

        if (! is_string($value)) {
            return $value;
        }

        $decoded = urldecode($value);

        return mb_check_encoding($decoded, 'UTF-8') ? $decoded : $value;
    }
}
