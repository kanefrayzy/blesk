<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class KnownPhone extends Model
{
    protected $table = 'cabinet_known_phones';

    protected $fillable = ['phone_hash', 'code_sent_at', 'logged_in_at'];

    protected function casts(): array
    {
        return [
            'code_sent_at' => 'datetime',
            'logged_in_at' => 'datetime',
        ];
    }

    /**
     * Номер не храним: для «видели или нет» он не нужен, а таблица живёт
     * вечно, в отличие от сессий. Соль из ключа приложения — чтобы отпечаток
     * нельзя было подобрать перебором одиннадцати цифр.
     */
    public static function fingerprint(string $phone): string
    {
        return hash_hmac('sha256', $phone, (string) config('app.key'));
    }

    public static function knows(string $phone): bool
    {
        return self::query()->where('phone_hash', self::fingerprint($phone))->exists();
    }

    public static function remember(string $phone, string $event): void
    {
        $now = now();

        DB::table('cabinet_known_phones')->upsert(
            [[
                'phone_hash' => self::fingerprint($phone),
                $event => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]],
            ['phone_hash'],
            [$event, 'updated_at'],
        );
    }
}
