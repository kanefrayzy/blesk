<?php

use App\Models\Post;
use Database\Seeders\PostSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /** Статья обещала кабинет «в будущем». Правим, только если текст не меняли в панели. */
    public function up(): void
    {
        $post = Post::query()->where('slug', 'rebrending-i-lichnyy-kabinet')->first();
        if ($post === null || ! str_contains(preg_replace('/\s+/u', ' ', (string) $post->body), 'мы готовим личный кабинет')) {
            return;
        }

        $material = collect((new PostSeeder)->materials())->firstWhere('slug', 'rebrending-i-lichnyy-kabinet');

        $post->update([
            'excerpt' => $material['excerpt'],
            'body' => $material['body'],
        ]);
    }

    public function down(): void
    {
        //
    }
};
