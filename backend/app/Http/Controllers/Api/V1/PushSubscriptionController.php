<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CabinetSession;
use App\Models\PushSubscription;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function config(Request $request, WebPushService $push): JsonResponse
    {
        if (! CabinetSession::fromRequest($request)) {
            return response()->json(['message' => 'Сессия истекла.'], 401);
        }

        if (! $push->configured()) {
            return response()->json(['message' => 'Push-уведомления пока не настроены.'], 503);
        }

        return response()->json(['public_key' => config('webpush.public_key')]);
    }

    public function store(Request $request): JsonResponse
    {
        $session = CabinetSession::fromRequest($request);
        if (! $session) {
            return response()->json(['message' => 'Сессия истекла.'], 401);
        }

        $data = $request->validate([
            'endpoint' => ['required', 'url:https', 'max:2048'],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth' => ['required', 'string', 'max:255'],
            'content_encoding' => ['nullable', 'in:aesgcm,aes128gcm'],
        ]);

        PushSubscription::query()->updateOrCreate(
            ['endpoint_hash' => hash('sha256', $data['endpoint'])],
            [
                'contr_id' => $session->contr_id,
                'endpoint' => $data['endpoint'],
                'public_key' => $data['keys']['p256dh'],
                'auth_token' => $data['keys']['auth'],
                'content_encoding' => $data['content_encoding'] ?? 'aes128gcm',
            ],
        );

        return response()->json(['message' => 'Push-уведомления включены.'], 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        $session = CabinetSession::fromRequest($request);
        if (! $session) {
            return response()->json(['message' => 'Сессия истекла.'], 401);
        }

        $data = $request->validate(['endpoint' => ['required', 'url:https', 'max:2048']]);
        PushSubscription::query()
            ->where('contr_id', $session->contr_id)
            ->where('endpoint_hash', hash('sha256', $data['endpoint']))
            ->delete();

        return response()->json(['message' => 'Push-уведомления выключены.']);
    }
}
