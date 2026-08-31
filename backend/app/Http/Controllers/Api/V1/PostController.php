<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\Rubric;
use App\Http\Controllers\Controller;
use App\Http\Resources\V1\PostResource;
use App\Http\Resources\V1\PostSummaryResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class PostController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'rubric' => ['nullable', Rule::enum(Rubric::class)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ]);

        $posts = Post::query()
            ->published()
            ->when(
                $filters['rubric'] ?? null,
                fn ($query, string $rubric) => $query->where('rubric', $rubric),
            )
            ->recentFirst()
            ->paginate($filters['per_page'] ?? 12);

        return PostSummaryResource::collection($posts);
    }

    public function show(Post $post): PostResource
    {
        // Черновик и отложенная публикация наружу не показываются даже по прямой ссылке.
        if (! $post->isPublished()) {
            throw new NotFoundHttpException;
        }

        return new PostResource($post);
    }
}
