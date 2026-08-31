<?php

namespace App\Models;

use App\Enums\Rubric;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Материал раздела «Новости и статьи».
 *
 * Состояние публикации хранится одной датой: null — черновик, будущая дата —
 * отложенная публикация, прошедшая — опубликован. Отдельный флаг завёл бы
 * второй источник правды.
 */
class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory;

    protected $fillable = [
        'slug',
        'rubric',
        'title',
        'excerpt',
        'body',
        'cover_path',
        'cover_alt',
        'seo_title',
        'seo_description',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'rubric' => Rubric::class,
            'published_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    #[Scope]
    protected function published(Builder $query): void
    {
        $query->whereNotNull('published_at')->where('published_at', '<=', Carbon::now());
    }

    #[Scope]
    protected function recentFirst(Builder $query): void
    {
        $query->orderByDesc('published_at')->orderByDesc('id');
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null && $this->published_at->isPast();
    }

    /** Минуты чтения по объёму текста: 180 слов в минуту, не меньше одной. */
    public function readingMinutes(): int
    {
        // str_word_count кириллицу в UTF-8 считает неверно, поэтому регуляркой.
        $words = preg_match_all('/[\p{L}\p{N}]+/u', strip_tags($this->body));

        return max(1, (int) ceil($words / 180));
    }
}
