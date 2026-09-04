<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\AgbisException;
use App\Http\Controllers\Controller;
use App\Models\CabinetPreference;
use App\Models\CabinetSession;
use App\Services\AgbisClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CabinetController extends Controller
{
    public function dashboard(Request $request, AgbisClient $agbis): JsonResponse
    {
        $session = CabinetSession::fromRequest($request);

        if (! $session) {
            return response()->json(['message' => 'Сессия истекла. Войдите ещё раз.'], 401);
        }

        try {
            $activeResult = $agbis->orders($session->agbis_session);
            $historyResult = $agbis->ordersHistory($session->agbis_session);
            $profileResult = $agbis->contrInfo($session->agbis_session);
        } catch (AgbisException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        if ((int) ($activeResult['error'] ?? 0) === 3) {
            $session->delete();

            return response()->json(['message' => 'Сессия истекла. Войдите ещё раз.'], 401)
                ->withoutCookie(config('agbis.cookie'));
        }

        $active = [];
        foreach (($activeResult['orders'] ?? $activeResult['order'] ?? []) as $order) {
            if (! is_array($order)) {
                continue;
            }

            $orderId = (string) ($order['dor_id'] ?? '');
            $details = [];
            $photos = [];

            if ($orderId !== '') {
                try {
                    $details = $agbis->fullOrderInfo($session->agbis_session, $orderId);
                    if ((string) ($order['photo_exist'] ?? '0') === '1') {
                        $photos = $agbis->orderImages($session->agbis_session, $orderId)['photos'] ?? [];
                    }
                } catch (AgbisException) {
                    // Карточка заказа останется доступна с краткими данными.
                }
            }

            $active[] = $this->presentOrder($order, $details, $photos);
        }

        $history = array_map(
            fn (array $order): array => $this->presentOrder($order, $order, []),
            array_values(array_filter($historyResult['orders_history'] ?? [], 'is_array')),
        );

        $preference = CabinetPreference::query()->firstOrCreate(['contr_id' => $session->contr_id]);

        return response()->json([
            'profile' => [
                'name' => $this->profileName($profileResult),
                'phone' => $this->formatPhone($session->phone),
                'promo_code' => $session->promo_code,
            ],
            'orders' => $active,
            'history' => $history,
            'preferences' => [
                'email' => $preference->email,
                'email_notifications' => $preference->email_notifications,
                'push_notifications' => $preference->push_notifications,
            ],
        ]);
    }

    public function preferences(Request $request): JsonResponse
    {
        $session = CabinetSession::fromRequest($request);

        if (! $session) {
            return response()->json(['message' => 'Сессия истекла. Войдите ещё раз.'], 401);
        }

        $data = $request->validate([
            'email' => ['nullable', 'email:rfc', 'max:160', 'required_if:email_notifications,true'],
            'email_notifications' => ['required', 'boolean'],
            'push_notifications' => ['required', 'boolean'],
        ]);

        $preference = CabinetPreference::query()->updateOrCreate(
            ['contr_id' => $session->contr_id],
            [
                'email' => filled($data['email'] ?? null) ? mb_strtolower(trim($data['email'])) : null,
                'email_notifications' => $data['email_notifications'],
                'push_notifications' => $data['push_notifications'],
            ],
        );

        // Пока SMTP не подключён: фиксируем событие без адреса и персональных данных.
        if ($preference->email_notifications) {
            Log::info('Cabinet email notifications enabled', ['contr_id' => $session->contr_id]);
        }

        return response()->json(['message' => 'Настройки сохранены.']);
    }

    public function photo(Request $request, string $photoId, AgbisClient $agbis): Response|JsonResponse
    {
        $session = CabinetSession::fromRequest($request);

        if (! $session) {
            return response()->json(['message' => 'Сессия истекла.'], 401);
        }

        $serviceId = (string) $request->query('service');
        if (! preg_match('/^\d+$/', $photoId) || ! preg_match('/^\d+$/', $serviceId)) {
            return response()->json(['message' => 'Фотография не найдена.'], 404);
        }

        try {
            $photo = $agbis->photo($session->agbis_session, $photoId, $serviceId);
        } catch (AgbisException) {
            return response()->json(['message' => 'Не удалось загрузить фотографию.'], 503);
        }

        return response($photo->body(), 200, [
            'Content-Type' => $photo->header('Content-Type', 'image/png'),
            'Cache-Control' => 'private, max-age=300',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function presentOrder(array $order, array $details, array $photos): array
    {
        $services = $details['order_services']
            ?? $details['order_servises']
            ?? $details['services']
            ?? $order['services']
            ?? [];

        $photoMap = [];
        foreach ($photos as $photo) {
            if (! is_array($photo) || blank($photo['photo_id'] ?? null) || blank($photo['dos_id'] ?? null)) {
                continue;
            }
            $photoMap[(string) $photo['dos_id']][] = [
                'id' => (string) $photo['photo_id'],
                'service_id' => (string) $photo['dos_id'],
            ];
        }

        $items = [];
        foreach ($services as $service) {
            if (! is_array($service)) {
                continue;
            }

            $id = (string) ($service['dos_id'] ?? '');
            $addons = [];
            foreach (($service['addons'] ?? []) as $addon) {
                if (! is_array($addon) || blank($addon['descr'] ?? null) || blank($addon['aos_value'] ?? null)) {
                    continue;
                }
                $addons[] = [
                    'label' => trim((string) $addon['descr']),
                    'value' => trim((string) $addon['aos_value']),
                ];
            }

            $items[] = [
                'id' => $id,
                'name' => preg_replace('/^А\s+/u', '', trim((string) ($service['name'] ?? $service['service'] ?? 'Изделие'))),
                'status' => $this->publicStatus((string) ($service['status_name'] ?? $order['condition_name'] ?? '')),
                'price' => $this->number($service['kredit'] ?? $service['price'] ?? 0),
                'discount' => $this->number($service['discount'] ?? 0),
                'details' => $addons,
                'photos' => $photoMap[$id] ?? [],
            ];
        }

        $amount = $this->number($order['kredit'] ?? 0);
        if ($amount <= 0 && $items !== []) {
            $amount = array_sum(array_column($items, 'price'));
        }

        return [
            'id' => (string) ($order['dor_id'] ?? ''),
            'number' => (string) ($order['doc_num'] ?? '—'),
            'created_at' => (string) ($order['doc_date'] ?? $order['date'] ?? ''),
            'ready_at' => (string) ($order['date_out'] ?? ''),
            'status' => $this->publicStatus((string) ($order['condition_name'] ?? $order['status_name'] ?? $order['status'] ?? '')),
            'amount' => $amount,
            'paid' => $this->number($order['debet'] ?? 0),
            'pickup' => trim((string) ($order['sclad_name'] ?? $order['sclad_to_name'] ?? 'Энергетическая, 9')),
            'items' => $items,
        ];
    }

    private function publicStatus(string $source): array
    {
        $ready = preg_match('/готов|выдан|закрыт|выполнен|исполнен/ui', $source) === 1
            || (ctype_digit($source) && (int) $source >= 4);

        return [
            'code' => $ready ? 'ready' : 'in_work',
            'label' => $ready ? 'Вещь готова к выдаче' : 'Вещь в работе',
        ];
    }

    private function profileName(array $profile): ?string
    {
        foreach (['Name', 'name', 'fio', 'contr_name'] as $key) {
            $value = Arr::get($profile, $key);
            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }

    private function number(mixed $value): float
    {
        return (float) str_replace(',', '.', (string) $value);
    }

    private function formatPhone(string $phone): string
    {
        return preg_replace('/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/', '+7 ($1) $2-$3-$4', $phone) ?? $phone;
    }
}
