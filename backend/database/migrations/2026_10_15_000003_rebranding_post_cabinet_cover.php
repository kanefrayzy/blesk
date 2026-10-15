<?php

use App\Models\Post;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /** Обложка новости о кабинете — телефон с кабинетом, как в ролике. Свою из панели не трогаем. */
    public function up(): void
    {
        if (app()->runningUnitTests()) {
            return;
        }

        $post = Post::query()->where('slug', 'rebrending-i-lichnyy-kabinet')->first();
        if ($post === null || ! in_array($post->cover_path, [null, 'posts/rebranding.jpg'], true)) {
            return;
        }

        $target = 'posts/rebranding-cabinet.jpg';
        Storage::disk('public')->put($target, (string) file_get_contents(database_path('seeders/covers/rebranding-cabinet.jpg')), 'public');

        $post->update([
            'cover_path' => $target,
            'cover_alt' => 'Телефон с личным кабинетом «Блеска»: заказ готов, путь заказа и изделия в нём',
        ]);
    }

    public function down(): void
    {
        //
    }
};
