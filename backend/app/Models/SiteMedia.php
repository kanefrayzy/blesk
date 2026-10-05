<?php

namespace App\Models;

use App\Observers\SiteMediaObserver;
use App\Support\SiteMediaSlots;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

/**
 * Фотография на одном из мест сайта. Пока поля пустые, витрина показывает
 * стандартный снимок — поэтому сброс к стандарту это просто очистка.
 *
 * @property string $key
 * @property string $group
 * @property int $sort
 * @property string|null $image
 * @property string|null $image_mobile
 * @property string|null $alt
 */
#[ObservedBy(SiteMediaObserver::class)]
class SiteMedia extends Model
{
    protected $table = 'site_media';

    /** Папка на публичном диске. Чужие файлы наблюдатель не удаляет. */
    public const DIRECTORY = 'site-media';

    protected $fillable = [
        'image',
        'image_mobile',
        'alt',
    ];

    /**
     * Заводит строки под места из списка и убирает места, которых в списке
     * больше нет. Зовётся при открытии раздела панели, поэтому новое место
     * появляется там само, без миграции данных.
     */
    public static function syncSlots(): void
    {
        $sort = 0;
        $existing = self::query()->get()->keyBy('key');

        foreach (SiteMediaSlots::all() as $key => $slot) {
            // Служебные поля не заполняются из формы, поэтому forceFill.
            $media = $existing->get($key) ?? new self;
            $media->forceFill(['key' => $key, 'group' => $slot['group'], 'sort' => ++$sort]);

            if ($media->isDirty()) {
                $media->save();
            }
        }

        self::query()->whereNotIn('key', array_keys(SiteMediaSlots::all()))->get()->each->delete();
    }

    /** @return array<string, mixed> */
    public function slot(): array
    {
        return SiteMediaSlots::get($this->key);
    }

    public function isCustom(): bool
    {
        return filled($this->image) || filled($this->image_mobile);
    }

    /** Адрес снимка, который сейчас стоит на сайте для компьютера. */
    public function currentUrl(): string
    {
        return filled($this->image) ? self::publicUrl($this->image) : self::siteUrl($this->slot()['default']);
    }

    /**
     * Адрес снимка для телефона: свой мобильный, иначе свой основной,
     * иначе стандартный мобильный. Тот же порядок, что у витрины.
     */
    public function currentMobileUrl(): ?string
    {
        if (filled($this->image_mobile)) {
            return self::publicUrl($this->image_mobile);
        }

        if (filled($this->image)) {
            return self::publicUrl($this->image);
        }

        $default = $this->slot()['default_mobile'];

        return $default ? self::siteUrl($default) : null;
    }

    public static function publicUrl(string $path): string
    {
        return asset('storage/'.$path);
    }

    /** Стандартные снимки лежат у витрины, а не у панели. */
    public static function siteUrl(string $path): string
    {
        return rtrim((string) config('services.next.site_url'), '/').$path;
    }
}
