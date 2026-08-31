<?php

namespace Tests\Feature;

use App\Enums\Rubric;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_published_posts_newest_first(): void
    {
        $older = Post::factory()->publishedAt('2026-01-10 09:00:00')->create();
        $newer = Post::factory()->publishedAt('2026-05-20 09:00:00')->create();

        $response = $this->getJson('/api/v1/posts');

        $response->assertOk()
            ->assertJsonPath('data.0.slug', $newer->slug)
            ->assertJsonPath('data.1.slug', $older->slug)
            ->assertJsonCount(2, 'data');
    }

    public function test_index_hides_drafts_and_scheduled_posts(): void
    {
        $published = Post::factory()->create();
        Post::factory()->draft()->create();
        Post::factory()->scheduled()->create();

        $response = $this->getJson('/api/v1/posts');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $published->slug);
    }

    public function test_index_filters_by_rubric(): void
    {
        $news = Post::factory()->rubric(Rubric::News)->create();
        Post::factory()->rubric(Rubric::Storage)->create();

        $response = $this->getJson('/api/v1/posts?rubric=news');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $news->slug);
    }

    public function test_index_rejects_an_unknown_rubric(): void
    {
        $this->getJson('/api/v1/posts?rubric=nesushchestvuyushchaya')
            ->assertUnprocessable()
            ->assertJsonValidationErrorFor('rubric');
    }

    public function test_index_omits_the_article_body(): void
    {
        Post::factory()->create();

        $this->getJson('/api/v1/posts')
            ->assertOk()
            ->assertJsonMissingPath('data.0.body');
    }

    public function test_show_returns_the_full_article(): void
    {
        $post = Post::factory()->create(['body' => '<p>Текст материала</p>']);

        $this->getJson("/api/v1/posts/{$post->slug}")
            ->assertOk()
            ->assertJsonPath('data.slug', $post->slug)
            ->assertJsonPath('data.body', '<p>Текст материала</p>')
            ->assertJsonPath('data.rubric_label', $post->rubric->getLabel());
    }

    public function test_show_hides_a_draft(): void
    {
        $post = Post::factory()->draft()->create();

        $this->getJson("/api/v1/posts/{$post->slug}")->assertNotFound();
    }

    public function test_show_hides_a_scheduled_post_until_its_time(): void
    {
        $post = Post::factory()->scheduled()->create();

        $this->getJson("/api/v1/posts/{$post->slug}")->assertNotFound();
    }

    public function test_reading_time_is_at_least_one_minute(): void
    {
        $post = Post::factory()->create(['body' => '<p>Коротко.</p>']);

        $this->getJson("/api/v1/posts/{$post->slug}")
            ->assertOk()
            ->assertJsonPath('data.reading_minutes', 1);
    }
}
