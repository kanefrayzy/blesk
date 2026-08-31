<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

/**
 * Рубрики раздела. «Новости» — про саму компанию, остальные из SEO-структуры
 * стратегии: материалы, загрязнения, хранение, домашний уход.
 */
enum Rubric: string implements HasLabel
{
    case News = 'news';
    case Care = 'care';
    case Stains = 'stains';
    case Materials = 'materials';
    case Storage = 'storage';

    public function getLabel(): string
    {
        return match ($this) {
            self::News => 'Новости',
            self::Care => 'Уход дома',
            self::Stains => 'Пятна',
            self::Materials => 'Материалы',
            self::Storage => 'Хранение',
        };
    }

    /** Значения для выпадающих списков: значение перечисления => подпись. */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $case): array => [$case->value => $case->getLabel()])
            ->all();
    }
}
