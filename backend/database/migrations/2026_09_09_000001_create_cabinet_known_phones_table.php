<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Подсказка «этот номер мы уже видели»: по ней форма решает, показать
     * поле пароля или сразу предложить получить код. Не источник правды —
     * кабинет можно завести и мимо сайта, поэтому храним только отпечаток.
     */
    public function up(): void
    {
        Schema::create('cabinet_known_phones', function (Blueprint $table): void {
            $table->id();
            $table->string('phone_hash', 64)->unique();
            $table->timestamp('code_sent_at')->nullable();
            $table->timestamp('logged_in_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cabinet_known_phones');
    }
};
