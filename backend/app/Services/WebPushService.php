<?php

namespace App\Services;

use App\Models\PushSubscription as StoredSubscription;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Throwable;

class WebPushService
{
    public function configured(): bool
    {
        return filled(config('webpush.public_key')) && filled(config('webpush.private_key'));
    }

    public function send(string $contrId, string $title, string $body, string $url = '/lk'): void
    {
        if (! $this->configured()) {
            Log::warning('Web push is not configured');

            return;
        }

        $webPush = new WebPush([
            'VAPID' => [
                'subject' => config('webpush.subject'),
                'publicKey' => config('webpush.public_key'),
                'privateKey' => config('webpush.private_key'),
            ],
        ]);

        foreach (StoredSubscription::query()->where('contr_id', $contrId)->get() as $stored) {
            try {
                $subscription = new Subscription(
                    $stored->endpoint,
                    $stored->public_key,
                    $stored->auth_token,
                    $stored->content_encoding,
                );
                $webPush->queueNotification($subscription, json_encode([
                    'title' => $title,
                    'body' => $body,
                    'url' => $url,
                ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
            } catch (Throwable $exception) {
                Log::warning('Unable to queue web push', ['subscription_id' => $stored->id, 'error' => $exception->getMessage()]);
            }
        }

        foreach ($webPush->flush() as $report) {
            if ($report->isSubscriptionExpired()) {
                StoredSubscription::query()->where('endpoint_hash', hash('sha256', $report->getEndpoint()))->delete();
            } elseif (! $report->isSuccess()) {
                Log::warning('Web push delivery failed', ['reason' => $report->getReason()]);
            }
        }
    }
}
