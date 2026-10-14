<?php

namespace App\Support;

use Carbon\CarbonImmutable;

class AgbisDate
{
    private const MONTHS = [
        1 => 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ];

    /** «04.09.2026 18:00:00» → «4 сентября, до 18:00». Нераспознанное отдаёт как есть. */
    public static function human(string $value, bool $withTime = true): string
    {
        $value = trim($value);
        if (! preg_match('/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::\d{2})?)?$/', $value, $m)) {
            return $value;
        }

        [$day, $month, $year] = [(int) $m[1], (int) $m[2], (int) $m[3]];
        if (! checkdate($month, $day, $year)) {
            return $value;
        }

        $text = $day.' '.self::MONTHS[$month];
        if ($year !== CarbonImmutable::now('Europe/Moscow')->year) {
            $text .= ' '.$year;
        }

        if ($withTime && isset($m[4]) && ! ((int) $m[4] === 0 && (int) $m[5] === 0)) {
            $text .= ', до '.sprintf('%02d:%s', (int) $m[4], $m[5]);
        }

        return $text;
    }
}
