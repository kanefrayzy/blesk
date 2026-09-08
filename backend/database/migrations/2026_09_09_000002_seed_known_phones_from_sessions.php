<?php

use App\Models\CabinetSession;
use App\Models\KnownPhone;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * У кого есть живая сессия, у того есть и пароль. Без переноса форма
     * приняла бы их за новичков и повела за ненужным кодом.
     */
    public function up(): void
    {
        CabinetSession::query()->each(function (CabinetSession $session): void {
            KnownPhone::remember($session->phone, 'logged_in_at');
        });
    }

    public function down(): void
    {
        // Подсказку восстановить нечем: обратно из отпечатка номер не собрать.
    }
};
