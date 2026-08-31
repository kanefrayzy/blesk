<?php

namespace App\Http\Resources\V1;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Материал целиком, для страницы статьи.
 *
 * @mixin Post
 */
class PostResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'body' => $this->body,
            'rubric' => $this->rubric->value,
            'rubric_label' => $this->rubric->getLabel(),
            'cover_url' => $this->cover_path ? asset('storage/'.$this->cover_path) : null,
            'cover_alt' => $this->cover_alt,
            'seo_title' => $this->seo_title,
            'seo_description' => $this->seo_description,
            'published_at' => $this->published_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'reading_minutes' => $this->readingMinutes(),
        ];
    }
}
