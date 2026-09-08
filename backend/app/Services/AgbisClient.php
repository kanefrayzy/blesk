<?php

namespace App\Services;

use App\Exceptions\AgbisException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class AgbisClient
{
    /**
     * Картинка с кодом. AGBIS отдаёт её вместе с меткой в cookie: метку
     * придумывает только сервер, подставить свою нельзя. Живёт 5 минут
     * и сгорает после первой удачной проверки.
     *
     * @return array{id: string, image: string, type: string}
     */
    public function captcha(): array
    {
        $url = (string) config('agbis.captcha_url');

        try {
            $response = Http::timeout(config('agbis.timeout'))->connectTimeout(5)->get($url);
        } catch (ConnectionException) {
            throw new AgbisException;
        }

        $id = $response->cookies()->getCookieByName('CaptchaID')?->getValue();

        if (! $response->successful() || blank($id)) {
            throw new AgbisException;
        }

        return [
            'id' => $id,
            'image' => $response->body(),
            'type' => $response->header('Content-Type') ?: 'image/png',
        ];
    }

    public function registerVerified(string $phone, string $captchaId, string $captchaValue): array
    {
        return $this->json('ModernRegistrationVerified', [
            'phone' => $phone,
            'agree_to_receive_sms' => '1',
            'agree_to_receive_adv_sms' => '0',
            'agree_sms_order_reps' => '1',
            'registered_from' => '4',
        ], captcha: [$captchaId, $captchaValue]);
    }

    public function rememberVerified(string $phone, string $captchaId, string $captchaValue): array
    {
        return $this->json('ModernRememberPwdVerified', ['phone' => $phone], captcha: [$captchaId, $captchaValue]);
    }

    public function modernLogin(string $phone, string $password): array
    {
        return $this->json('ModernLogin', [
            'phone' => $phone,
            'pwd' => sha1($password),
        ]);
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

    /**
     * @param  array{0: string, 1: string}|null  $captcha  метка и введённый код
     */
    private function json(string $command, ?array $payload = null, ?string $sessionId = null, ?array $captcha = null): array
    {
        $response = $this->request($command, $payload, $sessionId, $captcha);
        $data = $response->json();

        if (! is_array($data)) {
            throw new AgbisException;
        }

        return $this->decode($data);
    }

    /**
     * @param  array{0: string, 1: string}|null  $captcha
     */
    private function request(string $command, ?array $payload = null, ?string $sessionId = null, ?array $captcha = null): Response
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

        // Метку капчи AGBIS принимает только в cookie — параметром её не передать.
        $cookies = [];
        if ($captcha !== null) {
            $query['CaptchaValue'] = $captcha[1];
            $cookies['CaptchaID'] = $captcha[0];
        }

        try {
            $client = Http::acceptJson();

            if ($cookies !== []) {
                $client = $client->withCookies($cookies, parse_url($baseUrl, PHP_URL_HOST));
            }

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
            $message = $response->json('Msg');

            throw is_string($message) && $message !== ''
                ? new AgbisException(rawurldecode($message), fromAgbis: true)
                : new AgbisException;
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
