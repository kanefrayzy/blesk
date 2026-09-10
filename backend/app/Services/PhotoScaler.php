<?php

namespace App\Services;

class PhotoScaler
{
    /** Стороны в пикселях: для плитки в карточке и для просмотра во весь экран. */
    public const THUMB = 320;

    public const FULL = 1600;

    /**
     * Уменьшает снимок до нужной стороны. AGBIS отдаёт фотопротокол в
     * исходном размере — 4096 пикселей и полмегабайта на вещь; в заказе из
     * четырёх вещей это два мегабайта на открытие карточки с телефона.
     *
     * Если картинку не удалось разобрать, отдаём как есть: показать
     * оригинал лучше, чем не показать ничего.
     *
     * @return array{body: string, type: string}
     */
    public function scale(string $body, int $maxSide): array
    {
        $size = @getimagesizefromstring($body);
        $type = is_array($size) ? ($size['mime'] ?? 'image/jpeg') : 'image/jpeg';

        if (! is_array($size) || ! function_exists('imagecreatefromstring')) {
            return ['body' => $body, 'type' => $type];
        }

        [$width, $height] = $size;
        $longest = max($width, $height);

        if ($longest <= $maxSide) {
            return ['body' => $body, 'type' => $type];
        }

        $source = @imagecreatefromstring($body);

        if ($source === false) {
            return ['body' => $body, 'type' => $type];
        }

        $ratio = $maxSide / $longest;
        $scaled = imagescale($source, (int) round($width * $ratio), (int) round($height * $ratio));
        imagedestroy($source);

        if ($scaled === false) {
            return ['body' => $body, 'type' => $type];
        }

        ob_start();
        imagejpeg($scaled, null, 82);
        $result = (string) ob_get_clean();
        imagedestroy($scaled);

        return $result === ''
            ? ['body' => $body, 'type' => $type]
            : ['body' => $result, 'type' => 'image/jpeg'];
    }
}
