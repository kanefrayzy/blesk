<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('rubric')->index();
            $table->string('title');
            $table->text('excerpt');
            $table->longText('body');
            $table->string('cover_path')->nullable();
            $table->string('cover_alt')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_description')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Витрина всегда просит опубликованные по свежести — индекс под этот запрос.
            $table->index(['published_at', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
