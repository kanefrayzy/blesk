<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Контент сайта, который правится в панели. Пути к фото — на публичном диске. */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('name', 120);
            $table->string('note', 200);
            $table->string('icon', 80);
            $table->string('card_photo')->nullable();
            $table->string('hero_photo')->nullable();
            $table->string('hero_alt', 200)->nullable();
            $table->string('process_photo')->nullable();
            $table->string('process_name', 120)->nullable();
            $table->string('process_note', 200)->nullable();
            $table->string('title', 200);
            $table->text('lead');
            $table->string('price', 60)->nullable();
            $table->string('price_note', 160)->nullable();
            $table->string('cta', 60);
            $table->string('risk_title', 160);
            $table->text('risk_punch')->nullable();
            $table->json('risk_items');
            $table->json('factors');
            $table->json('steps');
            $table->text('result')->nullable();
            $table->json('prices');
            $table->text('price_text')->nullable();
            $table->string('form', 16)->default('order');
            $table->string('seo_title', 200)->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });

        Schema::create('hero_slides', function (Blueprint $table): void {
            $table->id();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('label', 80);
            $table->text('title');
            $table->text('accent')->nullable();
            $table->text('note')->nullable();
            $table->string('photo')->nullable();
            $table->string('photo_mobile')->nullable();
            $table->string('alt', 200)->nullable();
            $table->string('href', 200)->nullable();
            $table->timestamps();
        });

        Schema::create('production_slides', function (Blueprint $table): void {
            $table->id();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('name', 120);
            $table->string('note', 200)->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();
        });

        Schema::create('vacancies', function (Blueprint $table): void {
            $table->id();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('title', 160);
            $table->text('summary');
            $table->string('photo')->nullable();
            $table->string('focus', 32)->default('center 40%');
            $table->json('duties');
            $table->json('requirements');
            $table->timestamps();
        });

        Schema::create('site_pages', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 40)->unique();
            $table->json('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_pages');
        Schema::dropIfExists('vacancies');
        Schema::dropIfExists('production_slides');
        Schema::dropIfExists('hero_slides');
        Schema::dropIfExists('services');
    }
};
