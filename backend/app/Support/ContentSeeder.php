<?php

namespace App\Support;

use App\Models\HeroSlide;
use App\Models\ProductionSlide;
use App\Models\Service;
use App\Models\SiteMedia;
use App\Models\SitePage;
use App\Models\Vacancy;
use Illuminate\Support\Facades\Storage;

/**
 * Первое наполнение панели тем, что было на сайте: тексты из
 * database/seeders/data/content.json, фото — копии из public/photo витрины.
 * Если фото уже заменили в «Фото на сайте», берём заменённое.
 */
class ContentSeeder
{
    private string $photoRoot;

    public function __construct(?string $photoRoot = null)
    {
        $this->photoRoot = $photoRoot ?? dirname(base_path()).'/public';
    }

    public function run(): void
    {
        $data = json_decode((string) file_get_contents(database_path('seeders/data/content.json')), true);

        if (! Service::query()->exists()) {
            foreach ($data['services'] as $i => $s) {
                $key = $this->keyOf($s['cardPhoto'], 'svc-');
                Service::query()->create([
                    'slug' => $s['slug'],
                    'sort' => $i + 1,
                    'name' => $s['name'],
                    'note' => $s['note'],
                    'icon' => $s['icon'],
                    'card_photo' => $this->override("service.$key", 'image') ?? $this->copy($s['cardPhoto']),
                    'hero_photo' => $this->copy($s['heroPhoto']),
                    'hero_alt' => $s['heroAlt'],
                    'process_photo' => $this->copy($s['processPhoto']),
                    'process_name' => $s['processName'],
                    'process_note' => $s['processNote'],
                    'title' => $s['title'],
                    'lead' => $s['lead'],
                    'price' => $s['price'],
                    'price_note' => $s['priceNote'],
                    'cta' => $s['cta'],
                    'risk_title' => $s['risk']['title'],
                    'risk_punch' => $s['risk']['punch'],
                    'risk_items' => $s['risk']['items'],
                    'factors' => $s['factors'],
                    'steps' => $s['steps'],
                    'result' => $s['result'],
                    'prices' => $s['prices'],
                    'price_text' => $s['priceText'],
                    'form' => $s['form'],
                    'seo_title' => $s['seoTitle'],
                    'seo_description' => $s['seoDescription'],
                ]);
            }
        }

        if (! HeroSlide::query()->exists()) {
            foreach ($data['heroSlides'] as $i => $h) {
                HeroSlide::query()->create([
                    'sort' => $i + 1,
                    'label' => $h['label'],
                    'title' => implode("\n", $h['title']),
                    'accent' => implode("\n", $h['accent']),
                    'note' => $h['note'],
                    'photo' => $this->override("hero.{$h['key']}", 'image') ?? $this->copy($h['photo']),
                    'photo_mobile' => $this->override("hero.{$h['key']}", 'image_mobile') ?? $this->copy($h['photoMobile']),
                    'alt' => $h['alt'],
                    'href' => $h['href'] ?: null,
                ]);
            }
        }

        if (! ProductionSlide::query()->exists()) {
            foreach ($data['production'] as $i => $p) {
                ProductionSlide::query()->create([
                    'sort' => $i + 1,
                    'name' => $p['name'],
                    'note' => $p['note'],
                    'photo' => $this->override("production.{$p['key']}", 'image') ?? $this->copy($p['photo']),
                ]);
            }
        }

        if (! Vacancy::query()->exists()) {
            foreach ($data['vacancies'] as $i => $v) {
                Vacancy::query()->create([
                    'sort' => $i + 1,
                    'title' => $v['title'],
                    'summary' => $v['summary'],
                    'photo' => $this->copy($v['photo']),
                    'focus' => match (true) {
                        (int) filter_var($v['focus'], FILTER_SANITIZE_NUMBER_INT) < 38 => 'center 30%',
                        default => 'center 45%',
                    },
                    'duties' => $v['duties'],
                    'requirements' => $v['requirements'],
                ]);
            }
        }

        foreach ([SitePage::DEALERS => 'dealerPage', SitePage::VACANCIES => 'vacanciesPage'] as $key => $source) {
            if (! SitePage::query()->where('key', $key)->exists()) {
                SitePage::query()->create(['key' => $key, 'content' => $this->copyAll($data[$source])]);
            }
        }
    }

    private function keyOf(string $path, string $prefix): string
    {
        return str_replace([$prefix, '.jpg'], '', basename($path));
    }

    /** Своё фото из «Фото на сайте» — копией, чтобы чистка того раздела его не стёрла. */
    private function override(string $key, string $field): ?string
    {
        $path = SiteMedia::query()->where('key', $key)->value($field);
        $disk = Storage::disk('public');

        if (blank($path) || ! $disk->exists($path)) {
            return null;
        }

        $target = ContentImage::DIRECTORY.'/'.basename($path);
        if (! $disk->exists($target)) {
            $disk->copy($path, $target);
        }

        return $target;
    }

    private function copy(?string $publicPath): ?string
    {
        if (blank($publicPath)) {
            return null;
        }

        $source = $this->photoRoot.$publicPath;
        if (! is_file($source)) {
            return null;
        }

        $target = ContentImage::DIRECTORY.'/'.basename($publicPath);
        $disk = Storage::disk('public');
        if (! $disk->exists($target)) {
            $disk->put($target, (string) file_get_contents($source), 'public');
        }

        return $target;
    }

    private function copyAll(mixed $value): mixed
    {
        if (is_array($value)) {
            return array_map($this->copyAll(...), $value);
        }

        if (is_string($value) && str_starts_with($value, '/photo/')) {
            return $this->copy($value);
        }

        return $value;
    }
}
