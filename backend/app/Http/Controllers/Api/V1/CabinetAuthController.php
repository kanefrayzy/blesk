<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\AgbisException;
use App\Http\Controllers\Controller;
use App\Models\CabinetSession;
use App\Models\KnownPhone;
use App\Services\AgbisClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CabinetAuthController extends Controller
{
    /**
     * Знаком ли нам номер. Ответ — подсказка для формы, а не истина:
     * кабинет можно завести мимо сайта, поэтому на обоих экранах остаётся
     * ссылка на другой путь.
     */
    public function checkPhone(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^\+7\d{10}$/'],
        ]);

        return response()->json(['known' => KnownPhone::knows($data['phone'])]);
    }

    /**
     * Картинка с кодом. AGBIS отдаёт метку в cookie на своём домене, а ходим
     * к нему мы с сервера — поэтому метку держим у себя, а браузеру выдаём
     * только одноразовый ключ к ней.
     */
    public function captcha(AgbisClient $agbis): JsonResponse
    {
        try {
            $captcha = $agbis->captcha();
        } catch (AgbisException $exception) {
            return response()->json(['message' => $exception->getMessage()], 503);
        }

        $key = Str::random(48);
        Cache::put($this->captchaKey($key), $captcha['id'], config('agbis.captcha_ttl'));

        return response()->json([
            'token' => $key,
            'image' => 'data:'.$captcha['type'].';base64,'.base64_encode($captcha['image']),
            'expires_in' => config('agbis.captcha_ttl'),
        ]);
    }

    /**
     * Выдать пароль: первый вход или забытый пароль. Обе команды AGBIS
     * закрыты капчей, и метка сгорает после первой же проверки — поэтому
     * на каждую попытку нужна своя картинка.
     */
    public function sendCode(Request $request, AgbisClient $agbis): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^\+7\d{10}$/'],
            'captcha_token' => ['required', 'string', 'size:48'],
            'captcha_value' => ['required', 'string', 'max:16'],
            'mode' => ['required', 'in:register,reset'],
            'consent' => ['accepted'],
        ]);

        $captchaId = Cache::pull($this->captchaKey($data['captcha_token']));

        if (! is_string($captchaId)) {
            return response()->json([
                'message' => 'Код с картинки устарел. Обновите картинку и попробуйте ещё раз.',
                'retry_captcha' => true,
            ], 422);
        }

        try {
            $result = $data['mode'] === 'reset'
                ? $agbis->rememberVerified($data['phone'], $captchaId, $data['captcha_value'])
                : $agbis->registerVerified($data['phone'], $captchaId, $data['captcha_value']);
        } catch (AgbisException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'retry_captcha' => true,
            ], $exception->fromAgbis ? 422 : 503);
        }

        // 116 — код с картинки не сошёлся. Картинка уже сгорела, нужна новая.
        if ((int) ($result['error'] ?? 0) === 116) {
            return response()->json([
                'message' => $result['Msg'] ?? 'Код с картинки введён неверно.',
                'retry_captcha' => true,
            ], 422);
        }

        if ((string) ($result['exists'] ?? '') === '1') {
            KnownPhone::remember($data['phone'], 'code_sent_at');

            return response()->json([
                'state' => 'has_password',
                'message' => 'У этого номера уже есть пароль от кабинета. Введите его или запросите новый.',
            ]);
        }

        if ((int) ($result['error'] ?? 1) !== 0) {
            return response()->json([
                'message' => $result['Msg'] ?? 'Не удалось отправить код.',
                'retry_captcha' => true,
            ], 422);
        }

        KnownPhone::remember($data['phone'], 'code_sent_at');

        return response()->json([
            'state' => 'sent',
            'message' => $result['Msg'] ?: 'Код-пароль отправлен в SMS.',
        ]);
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

        KnownPhone::remember($data['phone'], 'logged_in_at');

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

    private function captchaKey(string $token): string
    {
        return 'cabinet:captcha:'.$token;
    }
}
