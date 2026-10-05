<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Свои фотографии на местах сайта. Пустое поле — значит, на сайте
     * остаётся стандартный снимок из витрины. Строки заводит сама панель
     * по списку мест (App\Support\SiteMediaSlots).
     */
    public function up(): void
    {
        Schema::create('site_media', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 64)->unique();
            $table->string('group', 32);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->string('image')->nullable();
            $table->string('image_mobile')->nullable();
            $table->string('alt', 180)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_media');
    }
};
