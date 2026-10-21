<?php

namespace App\Support;

/** Обращение из карточки AGBIS: там «Фамилия Имя Отчество», иногда одно слово. */
class PersonName
{
    private const SURNAME = '/(ов|ев|ёв|ин|ын|ова|ева|ёва|ина|ына|ский|цкий|ская|цкая|ской|ко|ук|юк|ян|дзе|швили|их|ых)$/u';

    /** Всё после фамилии, как записано в карточке: «Вячеслав Алексеевич» или «В А». */
    public static function first(?string $full): ?string
    {
        $words = preg_split('/\s+/u', trim((string) $full), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $rest = match (true) {
            count($words) >= 2 => array_slice($words, 1),
            count($words) === 1 && ! preg_match(self::SURNAME, mb_strtolower($words[0])) => $words,
            default => [],
        };

        if ($rest === []) {
            return null;
        }

        return implode(' ', array_map(
            fn (string $word): string => mb_strtoupper(mb_substr($word, 0, 1)).mb_strtolower(mb_substr($word, 1)),
            $rest,
        ));
    }
}
