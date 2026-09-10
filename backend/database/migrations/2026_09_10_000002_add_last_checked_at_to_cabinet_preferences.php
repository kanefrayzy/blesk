<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cabinet_preferences', function (Blueprint $table): void {
            $table->timestamp('last_checked_at')->nullable()->after('last_orders_state');
        });
    }

    public function down(): void
    {
        Schema::table('cabinet_preferences', function (Blueprint $table): void {
            $table->dropColumn('last_checked_at');
        });
    }
};
