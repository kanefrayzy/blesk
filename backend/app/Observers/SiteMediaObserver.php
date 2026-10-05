<?php

namespace App\Observers;

use App\Models\SiteMedia;
use App\Services\NextRevalidator;
use App\Services\SiteImageProcessor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class SiteMediaObserver
{
    /** Поле → какой кадр места к нему относится. */
    private const FIELDS = ['image' => 'frame', 'image_mobile' => 'frame_mobile'];

    public function __construct(
        private readonly SiteImageProcessor $processor,
        private readonly NextRevalidator $revalidator,
    ) {}

    public function saving(SiteMedia $media): void
    {
        foreach (self::FIELDS as $field => $frameKey) {
            $path = $media->getAttribute($field);

            if (! $media->isDirty($field) || blank($path)) {
                continue;
            }

            $frame = $media->slot()[$frameKey];

            if ($frame === null) {
                $media->setAttribute($field, null);

                continue;
            }

            try {
                $media->setAttribute($field, $this->processor->normalize($path, $frame));
            } catch (RuntimeException $exception) {
                throw ValidationException::withMessages(['data.'.$field => $exception->getMessage()]);
            }
        }
    }

    public function saved(SiteMedia $media): void
    {
        $replaced = [];

        foreach (array_keys(self::FIELDS) as $field) {
            $before = $media->getOriginal($field);

            if ($media->wasChanged($field) && filled($before) && $before !== $media->getAttribute($field)) {
                $replaced[] = $before;
            }
        }

        // Первая загрузка ничего не заменяет, но сайту сообщить о ней надо.
        if (! $media->wasChanged(['image', 'image_mobile', 'alt'])) {
            return;
        }

        // После фиксации: иначе витрина успеет перечитать ещё старые данные.
        DB::afterCommit(function () use ($replaced): void {
            $this->forget($replaced);
            $this->revalidator->revalidate('site-media');
        });
    }

    public function deleted(SiteMedia $media): void
    {
        $this->forget([$media->image, $media->image_mobile]);
        $this->revalidator->revalidate('site-media');
    }

    /** @param  array<int, string|null>  $paths */
    private function forget(array $paths): void
    {
        foreach ($paths as $path) {
            // Удаляем только своё: путь из базы не должен увести за пределы папки.
            if (filled($path) && Str::startsWith($path, SiteMedia::DIRECTORY.'/') && ! Str::contains($path, '..')) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
