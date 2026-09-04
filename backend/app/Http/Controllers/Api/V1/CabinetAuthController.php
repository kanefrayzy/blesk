<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\AgbisException;
use App\Http\Controllers\Controller;
use App\Models\CabinetSession;
use App\Services\AgbisClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CabinetAuthController extends Controller
{
    public function identify(Request $request, AgbisClient $agbis): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^\+7\d{10}$/'],
            'consent' => ['accepted'],
        ]);

        try {
            $result = $agbis->modernRegistration($data['phone']);
        } catch (AgbisException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        $message = mb_strtolower((string) ($result['Msg'] ?? ''));
        $exists = (string) ($result['exists'] ?? '') === '1'
            || str_contains($message, 'уже зарегистрирован');

        if ($exists) {
            return response()->json([
                'state' => 'password',
                'message' => 'Номер найден. Введите пароль от личного кабинета.',
            ]);
        }

        if ((int) ($result['error'] ?? 1) === 0) {
            return response()->json([
                'state' => 'password',
                'is_new' => true,
                'message' => 'Код-пароль отправлен в SMS. Введите его, чтобы открыть кабинет.',
            ]);
        }

        return response()->json([
            'message' => $result['Msg'] ?? 'Не удалось проверить номер телефона.',
        ], 422);
    }

    public function login(Request $request, AgbisClient $agbis): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^\+7\d{10}$/'],
            'password' => ['required', 'string', 'min:4', 'max:100'],
        ]);

        try {
            $result = $agbis->modernLogin($data['phone'], $data['password']);
        } catch (AgbisException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        if ((int) ($result['error'] ?? 1) !== 0 || blank($result['Session_id'] ?? null)) {
            return response()->json([
                'message' => 'Не удалось войти. Проверьте пароль из SMS или запросите новый.',
            ], 422);
        }

        $token = Str::random(80);
        $days = config('agbis.session_days');

        CabinetSession::query()->create([
            'token_hash' => hash('sha256', $token),
            'agbis_session' => $result['Session_id'],
            'contr_id' => (string) ($result['contr_id'] ?? ''),
            'phone' => $data['phone'],
            'promo_code' => ($result['promo_code_friend'] ?? null) ?: null,
            'last_seen_at' => now(),
            'expires_at' => now()->addDays($days),
        ]);

        return response()->json(['message' => 'Вход выполнен.'])
            ->cookie(
                config('agbis.cookie'),
                $token,
                $days * 24 * 60,
                '/',
                null,
                app()->isProduction(),
                true,
                false,
                'lax',
            );
    }

    public function remember(Request $request, AgbisClient $agbis): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^\+7\d{10}$/'],
        ]);

        try {
            $result = $agbis->rememberPassword($data['phone']);
        } catch (AgbisException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        if ((int) ($result['error'] ?? 1) !== 0) {
            return response()->json([
                'message' => $result['Msg'] ?? 'Не удалось отправить новый пароль.',
            ], 422);
        }

        return response()->json(['message' => 'Новый код-пароль отправлен в SMS.']);
    }

    public function logout(Request $request, AgbisClient $agbis): JsonResponse
    {
        $session = CabinetSession::fromRequest($request);

        if ($session) {
            try {
                $agbis->logout($session->agbis_session);
            } catch (AgbisException) {
                // Локальный выход должен сработать даже при временной недоступности AGBIS.
            }

            $session->delete();
        }

        return response()->json(['message' => 'Вы вышли из кабинета.'])
            ->withoutCookie(config('agbis.cookie'));
    }
}
