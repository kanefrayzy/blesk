<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cabinet_preferences', function (Blueprint $table): void {
            $table->id();
            $table->string('contr_id', 64)->unique();
            $table->text('email')->nullable();
            $table->boolean('email_notifications')->default(false);
            $table->boolean('push_notifications')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cabinet_preferences');
    }
};
