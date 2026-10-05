<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Просит витрину сразу забыть закэшированные данные. Без этого новое фото
 * появится само, когда истечёт кэш витрины (несколько минут), — поэтому
 * неудача здесь не ошибка сохранения, а лишь задержка.
 */
class NextRevalidator
{
    public function revalidate(string $tag): bool
    {
        $url = (string) config('services.next.revalidate_url');
        $secret = (string) config('services.next.revalidate_secret');

        if ($url === '' || $secret === '') {
            return false;
        }

        try {
            $response = Http::timeout(5)
                ->connectTimeout(2)
                ->withHeaders(['X-Revalidate-Secret' => $secret])
                ->acceptJson()
                ->post($url, ['tag' => $tag]);
        } catch (ConnectionException $exception) {
            Log::warning('Витрина не ответила на сброс кэша', ['tag' => $tag, 'error' => $exception->getMessage()]);

            return false;
        }

        if (! $response->successful()) {
            Log::warning('Витрина отказала в сбросе кэша', ['tag' => $tag, 'status' => $response->status()]);

            return false;
        }

        return true;
    }
}
