<?php

namespace App\Models;

use App\Models\Concerns\RevalidatesContent;
use Illuminate\Database\Eloquent\Model;

/** Страница целиком в одном JSON: «Дилерам», «Вакансии». */
class SitePage extends Model
{
    use RevalidatesContent;

    public const DEALERS = 'dealers';

    public const VACANCIES = 'vacancies';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['content' => 'array'];
    }

    public static function contentOf(string $key): array
    {
        return self::query()->where('key', $key)->value('content') ?? [];
    }
}
