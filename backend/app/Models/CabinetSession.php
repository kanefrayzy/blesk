<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class CabinetSession extends Model
{
    protected $fillable = [
        'token_hash',
        'agbis_session',
        'contr_id',
        'phone',
        'promo_code',
        'last_seen_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'agbis_session' => 'encrypted',
            'last_seen_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public static function fromRequest(Request $request): ?self
    {
        $token = $request->cookie(config('agbis.cookie')) ?: $request->bearerToken();

        if (! is_string($token) || strlen($token) < 40) {
            return null;
        }

        $session = self::query()
            ->where('token_hash', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->first();

        if ($session && $session->last_seen_at->lt(now()->subMinutes(5))) {
            $session->forceFill(['last_seen_at' => now()])->save();
        }

        return $session;
    }
}
