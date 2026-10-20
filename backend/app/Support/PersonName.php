<?php

namespace App\Support;

/** Имя из карточки AGBIS: там «Фамилия Имя Отчество», иногда одно слово. */
class PersonName
{
    private const SURNAME = '/(ов|ев|ёв|ин|ын|ова|ева|ёва|ина|ына|ский|цкий|ская|цкая|ской|ко|ук|юк|ян|дзе|швили|их|ых)$/u';

    public static function first(?string $full): ?string
    {
        $words = preg_split('/\s+/u', trim((string) $full), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $name = match (true) {
            count($words) >= 2 => $words[1],
            count($words) === 1 && ! preg_match(self::SURNAME, mb_strtolower($words[0])) => $words[0],
            default => null,
        };

        // Инициал вместо имени («Иванов И.») — обращаться не к чему.
        if ($name === null || mb_strlen(rtrim($name, '.')) < 2) {
            return null;
        }

        return mb_strtoupper(mb_substr($name, 0, 1)).mb_strtolower(mb_substr($name, 1));
    }
}
