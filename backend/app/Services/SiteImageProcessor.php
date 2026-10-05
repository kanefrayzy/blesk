<?php

namespace App\Services;

use App\Models\SiteMedia;
use GdImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Приводит загруженный снимок к виду, в котором его ждёт вёрстка.
 *
 * Пропорции дожимаем здесь, а не валидацией: редактор кадрирования
 * округляет до пикселя, и строгая проверка отбивала бы честно обрезанный
 * кадр. Поэтому принимаем любой достаточно крупный снимок и сами обрезаем
 * по центру — редактор лишь помогает выбрать, какая часть останется.
 *
 * Заодно снимаем то, что вредит на сайте: поворот из EXIF (телефон пишет
 * снимок боком), прозрачность PNG и сами метаданные — в них бывают
 * координаты съёмки.
 */
class SiteImageProcessor
{
    public const QUALITY = 86;

    /**
     * @param  array{ratio: array{0: int, 1: int}, min: int, max: int}  $frame
     * @return string путь нового файла на публичном диске
     */
    public function normalize(string $path, array $frame): string
    {
        // Снимок с телефона в 24 Мп разворачивается в GD примерно в 100 МБ,
        // а поворот на время держит вторую копию.
        $this->raiseMemoryLimit(1024);

        $disk = Storage::disk('public');
        $bytes = $disk->get($path);

        if ($bytes === null || ! in_array(getimagesizefromstring($bytes)[2] ?? null, [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
            throw new RuntimeException('Подходят снимки JPG, PNG или WebP.');
        }

        $source = @imagecreatefromstring($bytes);

        if (! $source instanceof GdImage) {
            throw new RuntimeException('Файл не похож на изображение.');
        }

        $source = $this->orient($source, $this->orientation($disk->path($path), $bytes));

        [$ratioW, $ratioH] = $frame['ratio'];
        $width = imagesx($source);
        $height = imagesy($source);

        [$cropX, $cropY, $cropW, $cropH] = $this->centerCrop($width, $height, $ratioW / $ratioH);

        $outW = min($cropW, $frame['max']);
        $outH = (int) round($outW * $ratioH / $ratioW);

        $canvas = imagecreatetruecolor($outW, $outH);
        // Прозрачный PNG иначе ляжет на чёрный фон.
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
        imagecopyresampled($canvas, $source, 0, 0, $cropX, $cropY, $outW, $outH, $cropW, $cropH);
        unset($source, $bytes);
        imageinterlace($canvas, true);

        ob_start();
        imagejpeg($canvas, null, self::QUALITY);
        $jpeg = (string) ob_get_clean();

        $target = SiteMedia::DIRECTORY.'/'.Str::lower(Str::random(24)).'.jpg';
        $disk->put($target, $jpeg, 'public');

        if ($target !== $path) {
            $disk->delete($path);
        }

        return $target;
    }

    /**
     * Ширина кадра после поворота и обрезки под пропорции, без загрузки
     * всего снимка в память — для проверки «не слишком ли мелко».
     *
     * @param  array{ratio: array{0: int, 1: int}, min: int, max: int}  $frame
     */
    public function croppedWidth(string $absolutePath, array $frame): ?int
    {
        $size = @getimagesize($absolutePath);

        if ($size === false) {
            return null;
        }

        [$width, $height] = $size;

        if (in_array($this->orientation($absolutePath, null), [5, 6, 7, 8], true)) {
            [$width, $height] = [$height, $width];
        }

        return $this->centerCrop($width, $height, $frame['ratio'][0] / $frame['ratio'][1])[2];
    }

    /** @return array{0: int, 1: int, 2: int, 3: int} x, y, ширина, высота */
    private function centerCrop(int $width, int $height, float $ratio): array
    {
        if ($width / $height > $ratio) {
            $cropW = (int) round($height * $ratio);

            return [intdiv($width - $cropW, 2), 0, $cropW, $height];
        }

        $cropH = (int) round($width / $ratio);

        return [0, intdiv($height - $cropH, 2), $width, $cropH];
    }

    private function orientation(string $absolutePath, ?string $bytes): int
    {
        if (! function_exists('exif_read_data')) {
            return 1;
        }

        $type = $bytes !== null ? (getimagesizefromstring($bytes)[2] ?? null) : (@getimagesize($absolutePath)[2] ?? null);

        if ($type !== IMAGETYPE_JPEG) {
            return 1;
        }

        $exif = @exif_read_data($absolutePath);

        return is_array($exif) ? (int) ($exif['Orientation'] ?? 1) : 1;
    }

    /** Поворот по значению Orientation из EXIF (1–8). */
    public function orient(GdImage $image, int $orientation): GdImage
    {
        if (in_array($orientation, [2, 4, 5, 7], true)) {
            imageflip($image, IMG_FLIP_HORIZONTAL);
        }

        // imagerotate крутит против часовой: 270 — это 90 по часовой.
        $angle = match ($orientation) {
            3, 4 => 180,
            6, 7 => 270,
            5, 8 => 90,
            default => 0,
        };

        if ($angle === 0) {
            return $image;
        }

        $rotated = imagerotate($image, $angle, 0);

        return $rotated instanceof GdImage ? $rotated : $image;
    }

    private function raiseMemoryLimit(int $megabytes): void
    {
        $current = ini_get('memory_limit');

        if ($current === false || $current === '-1') {
            return;
        }

        $bytes = (int) $current * match (strtolower(substr(trim($current), -1))) {
            'g' => 1024 ** 3,
            'm' => 1024 ** 2,
            'k' => 1024,
            default => 1,
        };

        if ($bytes < $megabytes * 1024 ** 2) {
            ini_set('memory_limit', $megabytes.'M');
        }
    }
}
