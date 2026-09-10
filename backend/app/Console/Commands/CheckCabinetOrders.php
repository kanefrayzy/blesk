<?php

namespace App\Console\Commands;

use App\Exceptions\AgbisException;
use App\Mail\OrderStatusChanged;
use App\Models\CabinetPreference;
use App\Models\CabinetSession;
use App\Services\AgbisClient;
use App\Services\OrderChangeMessage;
use App\Services\WebPushService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

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

                // AGBIS сообщает об отказе кодом внутри ответа, HTTP при этом 200.
                // Без этой проверки недоступная база выглядит как «заказов не стало»,
                // отпечаток меняется, и клиенту уходит ложное «статус изменился».
                if ((int) ($result['error'] ?? 0) !== 0) {
                    return;
                }

                $state = [];
                foreach ($result['orders'] ?? [] as $order) {
                    if (is_array($order) && filled($order['dor_id'] ?? null)) {
                        $state[(string) $order['dor_id']] = OrderChangeMessage::state($order);
                    }
                }

                $previous = $preference->last_orders_state;

                // Первый обход только запоминает: иначе клиент получил бы письмо
                // обо всех своих заказах сразу после включения уведомлений.
                if (is_array($previous)) {
                    $message = OrderChangeMessage::between($previous, $state);

                    if ($message !== null) {
                        $this->notify($preference, $push, $message);
                    }
                }

                $preference->forceFill(['last_orders_state' => $state])->save();
            });

        CabinetSession::query()->where('expires_at', '<=', now())->delete();

        return self::SUCCESS;
    }

    /**
     * @param  array{title: string, body: string}  $message
     */
    private function notify(CabinetPreference $preference, WebPushService $push, array $message): void
    {
        if ($preference->push_notifications) {
            $push->send($preference->contr_id, $message['title'], $message['body']);
        }

        if (! $preference->email_notifications || blank($preference->email)) {
            return;
        }

        try {
            Mail::to($preference->email)->send(new OrderStatusChanged($message['title'], $message['body']));
        } catch (Throwable $exception) {
            // Недоступная почта не должна ронять обход остальных клиентов.
            Log::warning('Не удалось отправить письмо об изменении заказа', [
                'contr_id' => $preference->contr_id,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
