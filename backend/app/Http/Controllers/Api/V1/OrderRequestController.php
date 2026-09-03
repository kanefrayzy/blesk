<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Mail\OrderRequestReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class OrderRequestController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+()\-\s]{7,30}$/'],
            'email' => ['required', 'email:rfc', 'max:160'],
            'service' => ['required', 'string', 'max:160'],
            'urgency' => ['required', Rule::in(['standard', 'urgent_24h', 'express_3h'])],
            'contamination_level' => ['required', Rule::in(['normal', 'heavy', 'very_heavy'])],
            'contamination_types' => ['present', 'array', 'max:8'],
            'contamination_types.*' => ['string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'consent' => ['accepted'],
            'website' => ['nullable', 'string', 'max:200'],
            'page_url' => ['nullable', 'url:http,https', 'max:2048'],
            'referrer' => ['nullable', 'url:http,https', 'max:2048'],
            'utm_source' => ['nullable', 'string', 'max:255'],
            'utm_medium' => ['nullable', 'string', 'max:255'],
            'utm_campaign' => ['nullable', 'string', 'max:255'],
            'utm_content' => ['nullable', 'string', 'max:255'],
            'utm_term' => ['nullable', 'string', 'max:255'],
            'yclid' => ['nullable', 'string', 'max:255'],
        ]);

        // Поле скрыто от людей. Боту отвечаем успехом, но письмо не отправляем.
        if (filled($data['website'] ?? null)) {
            return response()->json(['message' => 'Заявка принята.'], 201);
        }

        unset($data['website'], $data['consent']);

        Mail::to(config('orders.recipient'))->send(new OrderRequestReceived($data));

        return response()->json(['message' => 'Заявка принята.'], 201);
    }
}
