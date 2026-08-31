<?php

namespace Database\Factories;

use App\Enums\Rubric;
use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $title = fake()->sentence();

        return [
            'title' => $title,
            'slug' => Str::slug($title, '-', 'ru').'-'.fake()->unique()->numberBetween(1, 999999),
            'rubric' => fake()->randomElement(Rubric::cases()),
            'excerpt' => fake()->paragraph(),
            'body' => '<p>'.fake()->paragraphs(4, true).'</p>',
            'published_at' => now()->subDays(fake()->numberBetween(1, 400)),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['published_at' => null]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (): array => ['published_at' => now()->addWeek()]);
    }

    public function rubric(Rubric $rubric): static
    {
        return $this->state(fn (): array => ['rubric' => $rubric]);
    }

    public function publishedAt(string $date): static
    {
        return $this->state(fn (): array => ['published_at' => $date]);
    }
}
