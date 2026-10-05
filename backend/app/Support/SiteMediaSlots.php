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
    public const GROUP_HERO = 'hero';

    public const GROUP_SERVICES = 'services';

    public const GROUP_PRODUCTION = 'production';

    public const GROUP_LOGIN = 'login';

    /** @var array<string, string> */
    public const GROUPS = [
        self::GROUP_HERO => 'Первый экран главной',
        self::GROUP_SERVICES => 'Услуги',
        self::GROUP_PRODUCTION => 'Наше производство',
        self::GROUP_LOGIN => 'Страница входа в кабинет',
    ];

    /**
     * Кадр для компьютера (и единственный, если мобильного нет).
     * ratio — пропорции, к которым приводим снимок; min — ширина, меньше
     * которой на больших экранах будет мыло; max — до какой ширины ужимаем.
     */
    private const HERO = ['ratio' => [64, 47], 'min' => 1600, 'max' => 2560];

    private const HERO_MOBILE = ['ratio' => [69, 128], 'min' => 800, 'max' => 1440];

    private const SERVICE = ['ratio' => [4, 5], 'min' => 600, 'max' => 1200];

    private const PRODUCTION = ['ratio' => [4, 3], 'min' => 1200, 'max' => 2000];

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
        $hero = fn (string $key, string $label, string $alt): array => [
            'group' => self::GROUP_HERO,
            'label' => $label,
            'default' => "/photo/hero-{$key}.jpg",
            'default_mobile' => "/photo/hero-{$key}-m.jpg",
            'default_alt' => $alt,
            'frame' => self::HERO,
            'frame_mobile' => self::HERO_MOBILE,
        ];

        $service = fn (string $key, string $label): array => [
            'group' => self::GROUP_SERVICES,
            'label' => $label,
            'default' => "/photo/svc-{$key}.jpg",
            'default_mobile' => null,
            'default_alt' => $label,
            'frame' => self::SERVICE,
            'frame_mobile' => null,
        ];

        $production = fn (string $key, string $label): array => [
            'group' => self::GROUP_PRODUCTION,
            'label' => $label,
            'default' => "/photo/prod-{$key}.jpg",
            'default_mobile' => null,
            'default_alt' => $label,
            'frame' => self::PRODUCTION,
            'frame_mobile' => null,
        ];

        return [
            'hero.odezhda' => $hero('odezhda', 'Слайд «Одежда»', 'Технолог «Блеска» осматривает шов шерстяного пальто в цехе'),
            'hero.shuba' => $hero('shuba', 'Слайд «Шубы и кожа»', 'Специалист «Блеска» расчёсывает мех шубы под рабочей лампой'),
            'hero.tekstil' => $hero('tekstil', 'Слайд «Домашний текстиль»', 'Сотрудница «Блеска» складывает чистое постельное бельё в цехе'),
            'hero.detskie' => $hero('detskie', 'Слайд «Детские вещи»', 'Сотрудница «Блеска» отдаёт ребёнку чистые детские вещи на приёмном пункте'),
            'hero.pitomcy' => $hero('pitomcy', 'Слайд «Вещи питомцев»', 'Хозяин с собакой на приёмном пункте «Блеска», сотрудница оформляет плед в чистку'),
            'hero.korp' => $hero('korp', 'Слайд «Бизнесу»', 'Технолог «Блеска» проверяет партию форменных пиджаков на конвейере цеха'),

            'service.odezhda' => $service('odezhda', 'Одежда'),
            'service.shuba' => $service('shuba', 'Шубы и кожа'),
            'service.tekstil' => $service('tekstil', 'Домашний текстиль'),
            'service.detskie' => $service('detskie', 'Детские вещи'),
            'service.pitomcy' => $service('pitomcy', 'Вещи питомцев'),
            'service.korp' => $service('korp', 'Корпоративное обслуживание'),

            'production.oborudovanie' => $production('oborudovanie', 'Современное оборудование'),
            'production.smena' => $production('smena', 'Профессиональная команда'),
            'production.kontrol' => $production('kontrol', 'Контроль качества'),
            'production.upakovka' => $production('upakovka', 'Аккуратная упаковка'),

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
