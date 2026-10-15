<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Места под фотографии на сайте. Набор закрыт: место — это кадр в
 * конкретной вёрстке, поэтому завести новое из панели нельзя, только
 * заменить снимок в существующем.
 *
 * Ключи совпадают с теми, что ждёт витрина (lib/siteMedia.ts), а default —
 * со снимком, который витрина покажет, пока своё фото не загружено.
 */
final class SiteMediaSlots
{
    public const GROUP_LOGIN = 'login';

    /** Фото первого экрана, услуг и производства правятся в своих разделах панели. */
    /** @var array<string, string> */
    public const GROUPS = [
        self::GROUP_LOGIN => 'Страница входа в кабинет',
    ];

    /**
     * Кадр для компьютера (и единственный, если мобильного нет).
     * ratio — пропорции, к которым приводим снимок; min — ширина, меньше
     * которой на больших экранах будет мыло; max — до какой ширины ужимаем.
     */
    private const LOGIN = ['ratio' => [17, 10], 'min' => 1000, 'max' => 2000];

    private const LOGIN_MOBILE = ['ratio' => [36, 25], 'min' => 800, 'max' => 1440];

    /**
     * @return array<string, array{
     *     group: string,
     *     label: string,
     *     default: string,
     *     default_mobile: string|null,
     *     default_alt: string,
     *     frame: array{ratio: array{0: int, 1: int}, min: int, max: int},
     *     frame_mobile: array{ratio: array{0: int, 1: int}, min: int, max: int}|null,
     * }>
     */
    public static function all(): array
    {
        return [
            'login.cabinet' => [
                'group' => self::GROUP_LOGIN,
                'label' => 'Фото над формой входа',
                'default' => '/photo/cabinet-push.jpg',
                'default_mobile' => '/photo/cabinet-push-m.jpg',
                'default_alt' => 'Клиентка получает на телефон уведомление химчистки «Блеск» о готовом заказе',
                'frame' => self::LOGIN,
                'frame_mobile' => self::LOGIN_MOBILE,
            ],
        ];
    }

    /**
     * @return array{
     *     group: string,
     *     label: string,
     *     default: string,
     *     default_mobile: string|null,
     *     default_alt: string,
     *     frame: array{ratio: array{0: int, 1: int}, min: int, max: int},
     *     frame_mobile: array{ratio: array{0: int, 1: int}, min: int, max: int}|null,
     * }
     */
    public static function get(string $key): array
    {
        return self::all()[$key] ?? throw new InvalidArgumentException("Неизвестное место под фото: {$key}");
    }

    public static function has(string $key): bool
    {
        return array_key_exists($key, self::all());
    }

    /** Пропорции кадра словами: «4 : 5». */
    public static function ratioLabel(array $frame): string
    {
        return $frame['ratio'][0].' : '.$frame['ratio'][1];
    }

    /** Минимальная высота при минимальной ширине — для подсказки в форме. */
    public static function minHeight(array $frame): int
    {
        return (int) ceil($frame['min'] * $frame['ratio'][1] / $frame['ratio'][0]);
    }
}
