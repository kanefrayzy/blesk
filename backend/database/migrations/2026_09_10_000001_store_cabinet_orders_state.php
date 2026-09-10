<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Вместо отпечатка храним само состояние заказов: по одному хешу нельзя
     * сказать, что именно изменилось, а уведомление «статус изменился» без
     * подробностей клиенту бесполезно. Данные производные — пересоберутся
     * при первом же опросе.
     */
    public function up(): void
    {
        Schema::table('cabinet_preferences', function (Blueprint $table): void {
            $table->text('last_orders_state')->nullable()->after('push_notifications');
            $table->dropColumn('last_order_signature');
        });
    }

    public function down(): void
    {
        Schema::table('cabinet_preferences', function (Blueprint $table): void {
            $table->string('last_order_signature', 64)->nullable();
            $table->dropColumn('last_orders_state');
        });
    }
};
