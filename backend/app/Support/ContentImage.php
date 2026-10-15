<?php

namespace App\Support;

use App\Services\SiteImageProcessor;
use GdImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/** Фото контента: ужимаем до разумной ширины, без обрезки, в папку content/. */
class ContentImage
{
    public const DIRECTORY = 'content';

    public const MAX_WIDTH = 2560;

    public static function store(string $absolutePath, int $maxWidth = self::MAX_WIDTH): string
    {
        $current = ini_get('memory_limit');
        if ($current !== false && $current !== '-1' && (int) $current < 1024) {
            ini_set('memory_limit', '1024M');
        }

        $bytes = (string) file_get_contents($absolutePath);
        $type = getimagesizefromstring($bytes)[2] ?? null;
        if (! in_array($type, [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
            throw new RuntimeException('Подходят снимки JPG, PNG или WebP.');
        }

        $source = @imagecreatefromstring($bytes);
        unset($bytes);
        if (! $source instanceof GdImage) {
            throw new RuntimeException('Файл не похож на изображение.');
        }

        $orientation = 1;
        if ($type === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
            $exif = @exif_read_data($absolutePath);
            $orientation = is_array($exif) ? (int) ($exif['Orientation'] ?? 1) : 1;
        }
        $source = app(SiteImageProcessor::class)->orient($source, $orientation);

        $width = imagesx($source);
        $height = imagesy($source);
        $outW = min($width, $maxWidth);
        $outH = (int) round($height * $outW / $width);

        $canvas = imagecreatetruecolor($outW, $outH);
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $outW, $outH, $width, $height);
        unset($source);
        imageinterlace($canvas, true);

        ob_start();
        imagejpeg($canvas, null, SiteImageProcessor::QUALITY);
        $jpeg = (string) ob_get_clean();

        $path = self::DIRECTORY.'/'.Str::lower(Str::random(24)).'.jpg';
        Storage::disk('public')->put($path, $jpeg, 'public');

        return $path;
    }

    public static function url(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        return asset('storage/'.$path);
    }

    /** Строки-пути к фото внутри JSON страницы превращаем в адреса. */
    public static function urlsIn(mixed $value): mixed
    {
        if (is_array($value)) {
            return array_map(self::urlsIn(...), $value);
        }

        if (is_string($value) && str_starts_with($value, self::DIRECTORY.'/')) {
            return self::url($value);
        }

        return $value;
    }
}
