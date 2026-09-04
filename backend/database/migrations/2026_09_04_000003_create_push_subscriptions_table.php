<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->string('contr_id', 64)->index();
            $table->string('endpoint_hash', 64)->unique();
            $table->text('endpoint');
            $table->text('public_key');
            $table->text('auth_token');
            $table->string('content_encoding', 24)->default('aes128gcm');
            $table->timestamps();
        });

        Schema::table('cabinet_preferences', function (Blueprint $table): void {
            $table->string('last_order_signature', 64)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('cabinet_preferences', function (Blueprint $table): void {
            $table->dropColumn('last_order_signature');
        });
        Schema::dropIfExists('push_subscriptions');
    }
};
