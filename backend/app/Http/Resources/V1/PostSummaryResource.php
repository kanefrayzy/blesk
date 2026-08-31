<?php

namespace App\Http\Resources\V1;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Материал для карточки в списке: без текста статьи, чтобы страница списка
 * не тянула десятки килобайт разметки на каждый материал.
 *
 * @mixin Post
 */
class PostSummaryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'rubric' => $this->rubric->value,
            'rubric_label' => $this->rubric->getLabel(),
            'cover_url' => $this->cover_path ? asset('storage/'.$this->cover_path) : null,
            'cover_alt' => $this->cover_alt,
            'published_at' => $this->published_at?->toIso8601String(),
            'reading_minutes' => $this->readingMinutes(),
        ];
    }
}
