<?php

namespace Tests\Unit;

use App\Services\PhotoScaler;
use PHPUnit\Framework\TestCase;

class PhotoScalerTest extends TestCase
{
    private function jpeg(int $width, int $height): string
    {
        $image = imagecreatetruecolor($width, $height);
        ob_start();
        imagejpeg($image, null, 90);
        imagedestroy($image);

        return (string) ob_get_clean();
    }

    public function test_large_photo_is_scaled_down_to_the_requested_side(): void
    {
        $result = (new PhotoScaler)->scale($this->jpeg(4096, 2160), PhotoScaler::THUMB);

        [$width, $height] = getimagesizefromstring($result['body']);

        $this->assertSame(PhotoScaler::THUMB, $width);
        $this->assertSame(169, $height, 'пропорции должны сохраняться');
        $this->assertSame('image/jpeg', $result['type']);
    }

    public function test_small_photo_is_left_untouched(): void
    {
        $original = $this->jpeg(200, 150);

        $result = (new PhotoScaler)->scale($original, PhotoScaler::THUMB);

        $this->assertSame($original, $result['body']);
    }

    public function test_type_comes_from_the_bytes_not_from_a_claim(): void
    {
        // AGBIS объявляет PNG в заголовке, а присылает JPEG.
        $result = (new PhotoScaler)->scale($this->jpeg(100, 100), PhotoScaler::FULL);

        $this->assertSame('image/jpeg', $result['type']);
    }

    public function test_unreadable_bytes_are_returned_as_is(): void
    {
        $result = (new PhotoScaler)->scale('это не картинка', PhotoScaler::THUMB);

        $this->assertSame('это не картинка', $result['body']);
    }
}
