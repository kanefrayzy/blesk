<?php

namespace App\Console\Commands;

use App\Exceptions\AgbisException;
use App\Models\CabinetPreference;
use App\Models\CabinetSession;
use App\Services\AgbisClient;
use App\Services\WebPushService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckCabinetOrders extends Command
{
    protected $signature = 'cabinet:check-orders';

    protected $description = 'Checks AGBIS order changes and sends cabinet notifications';

    public function handle(AgbisClient $agbis, WebPushService $push): int
    {
        CabinetPreference::query()
            ->where(fn ($query) => $query->where('push_notifications', true)->orWhere('email_notifications', true))
            ->each(function (CabinetPreference $preference) use ($agbis, $push): void {
                $session = CabinetSession::query()
                    ->where('contr_id', $preference->contr_id)
                    ->where('expires_at', '>', now())
                    ->latest('last_seen_at')
                    ->first();

                if (! $session) {
                    return;
                }

                try {
                    $result = $agbis->orders($session->agbis_session);
                } catch (AgbisException) {
                    return;
                }

                $state = collect($result['orders'] ?? [])->map(fn (array $order): array => [
                    'id' => (string) ($order['dor_id'] ?? ''),
                    'status' => (string) ($order['status'] ?? ''),
                    'condition' => (string) ($order['condition_id'] ?? ''),
                    'ready_at' => (string) ($order['date_out'] ?? ''),
                ])->sortBy('id')->values()->all();
                $signature = hash('sha256', json_encode($state, JSON_UNESCAPED_UNICODE));

                if ($preference->last_order_signature && ! hash_equals($preference->last_order_signature, $signature)) {
                    if ($preference->push_notifications) {
                        $push->send($preference->contr_id, 'Статус заказа изменился', 'Откройте «Блеск», чтобы посмотреть обновление.');
                    }
                    if ($preference->email_notifications) {
                        Log::info('Cabinet order email notification (log transport)', ['contr_id' => $preference->contr_id]);
                    }
                }

                $preference->forceFill(['last_order_signature' => $signature])->save();
            });

        CabinetSession::query()->where('expires_at', '<=', now())->delete();

        return self::SUCCESS;
    }
}
