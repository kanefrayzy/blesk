<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Когда клиент ответил «Не сейчас» на предложение включить уведомления.
     * Храним на сервере, а не в браузере: закрыв карточку на телефоне,
     * человек не должен видеть её снова на компьютере.
     */
    public function up(): void
    {
        Schema::table('cabinet_preferences', function (Blueprint $table): void {
            $table->timestamp('notifications_prompt_dismissed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('cabinet_preferences', function (Blueprint $table): void {
            $table->dropColumn('notifications_prompt_dismissed_at');
        });
    }
};
