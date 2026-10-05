<?php

namespace Tests\Feature;

use App\Filament\Resources\SiteMedia\Pages\EditSiteMedia;
use App\Models\SiteMedia;
use App\Models\User;
use App\Services\SiteImageProcessor;
use App\Support\SiteMediaSlots;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class SiteMediaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Http::fake();
        config([
            'services.next.revalidate_url' => 'http://127.0.0.1:3002/internal/revalidate',
            'services.next.revalidate_secret' => 'test-secret',
        ]);

        SiteMedia::syncSlots();
    }

    /** JPEG заданного размера прямо на публичном диске, как его кладёт Filament. */
    private function storeJpeg(int $width, int $height, string $name = 'raw.jpg'): string
    {
        $image = imagecreatetruecolor($width, $height);
        imagefill($image, 0, 0, imagecolorallocate($image, 20, 164, 175));
        ob_start();
        imagejpeg($image);
        Storage::disk('public')->put(SiteMedia::DIRECTORY.'/'.$name, (string) ob_get_clean());

        return SiteMedia::DIRECTORY.'/'.$name;
    }

    private function media(string $key): SiteMedia
    {
        return SiteMedia::query()->where('key', $key)->firstOrFail();
    }

    public function test_every_slot_gets_a_row_once(): void
    {
        SiteMedia::syncSlots();

        $this->assertSame(count(SiteMediaSlots::all()), SiteMedia::query()->count());
        $this->assertSame(['hero', 'services', 'production', 'login'], SiteMedia::query()->orderBy('sort')->pluck('group')->unique()->values()->all());
    }

    public function test_api_returns_only_replaced_slots_with_absolute_urls(): void
    {
        $this->getJson('/api/v1/site-media')->assertOk()->assertExactJson(['data' => []]);
        $this->assertSame('{"data":{}}', $this->get('/api/v1/site-media')->getContent());

        $this->media('service.shuba')->update(['image' => $this->storeJpeg(1200, 1500), 'alt' => 'Цех']);

        $data = $this->getJson('/api/v1/site-media')->assertOk()->json('data');

        $this->assertSame(['service.shuba'], array_keys($data));
        $this->assertStringStartsWith(url('/storage/site-media/'), $data['service.shuba']['src']);
        $this->assertNull($data['service.shuba']['src_mobile']);
        $this->assertSame('Цех', $data['service.shuba']['alt']);
    }

    public function test_upload_is_cropped_to_the_slot_and_shrunk(): void
    {
        $raw = $this->storeJpeg(3000, 1500);
        $media = $this->media('hero.odezhda');
        $media->update(['image' => $raw]);

        Storage::disk('public')->assertMissing($raw);
        $this->assertStringStartsWith('site-media/', $media->image);
        $this->assertStringEndsWith('.jpg', $media->image);

        [$width, $height] = getimagesizefromstring(Storage::disk('public')->get($media->image));
        // 64:47 по высоте 1500 — ширина 2043, она меньше предела 2560.
        $this->assertSame(2043, $width);
        $this->assertSame(1500, $height);
    }

    public function test_large_upload_is_limited_to_the_slot_width(): void
    {
        $media = $this->media('service.odezhda');
        $media->update(['image' => $this->storeJpeg(1600, 2400)]);

        [$width, $height] = getimagesizefromstring(Storage::disk('public')->get($media->image));
        $this->assertSame(1200, $width);
        $this->assertSame(1500, $height);
    }

    public function test_exif_orientation_is_applied(): void
    {
        $processor = app(SiteImageProcessor::class);

        // Полоса 2×1: левый пиксель красный. Поворот 90° по часовой (6)
        // ставит его наверх, против часовой (8) — вниз.
        $make = function () {
            $image = imagecreatetruecolor(2, 1);
            imagesetpixel($image, 0, 0, imagecolorallocate($image, 255, 0, 0));
            imagesetpixel($image, 1, 0, imagecolorallocate($image, 0, 0, 255));

            return $image;
        };

        $red = fn ($image, int $x, int $y): bool => (imagecolorat($image, $x, $y) >> 16 & 0xFF) > 200;

        $cw = $processor->orient($make(), 6);
        $this->assertSame([1, 2], [imagesx($cw), imagesy($cw)]);
        $this->assertTrue($red($cw, 0, 0));

        $ccw = $processor->orient($make(), 8);
        $this->assertTrue($red($ccw, 0, 1));

        $upside = $processor->orient($make(), 3);
        $this->assertTrue($red($upside, 1, 0));

        $this->assertTrue($red($processor->orient($make(), 1), 0, 0));
    }

    public function test_replacing_and_resetting_remove_old_files(): void
    {
        $media = $this->media('production.smena');
        $media->update(['image' => $this->storeJpeg(1600, 1200, 'first.jpg')]);
        $first = $media->image;

        $media->update(['image' => $this->storeJpeg(1600, 1200, 'second.jpg')]);
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists($media->image);

        $second = $media->image;
        $media->update(['image' => null, 'image_mobile' => null, 'alt' => null]);
        Storage::disk('public')->assertMissing($second);
        $this->assertFalse($media->fresh()->isCustom());
    }

    public function test_change_asks_the_site_to_refresh_and_noop_does_not(): void
    {
        $this->media('service.korp')->update(['alt' => 'Форма для ресторана']);

        Http::assertSent(fn (Request $request): bool => $request->url() === 'http://127.0.0.1:3002/internal/revalidate'
            && $request->header('X-Revalidate-Secret') === ['test-secret']
            && $request['tag'] === 'site-media');

        Http::fake();
        SiteMedia::syncSlots();
        $this->media('service.korp')->update(['alt' => 'Форма для ресторана']);

        Http::assertNothingSent();
    }

    public function test_mobile_frame_is_ignored_for_slots_without_one(): void
    {
        $media = $this->media('service.detskie');
        $media->update(['image_mobile' => $this->storeJpeg(800, 1000)]);

        $this->assertNull($media->fresh()->image_mobile);
    }

    public function test_site_shows_defaults_until_replaced(): void
    {
        config(['services.next.site_url' => 'https://bleskvip.ru']);
        $media = $this->media('hero.korp');

        $this->assertSame('https://bleskvip.ru/photo/hero-korp.jpg', $media->currentUrl());
        $this->assertSame('https://bleskvip.ru/photo/hero-korp-m.jpg', $media->currentMobileUrl());

        $media->update(['image' => $this->storeJpeg(2048, 1504)]);
        // Без своего мобильного кадра телефону уходит тот же новый снимок.
        $this->assertSame($media->currentUrl(), $media->currentMobileUrl());
    }

    public function test_editor_sees_the_section_and_can_open_a_slot(): void
    {
        $editor = User::factory()->editor()->create();
        $path = config('panel.path');

        $this->actingAs($editor)->get("/{$path}/site-media")->assertOk()->assertSee('Слайд «Одежда»');
        $this->actingAs($editor)->get("/{$path}/site-media/{$this->media('login.cabinet')->id}/edit")->assertOk();
    }

    public function test_too_small_photo_is_rejected_in_the_form(): void
    {
        $this->actingAs(User::factory()->editor()->create());

        Livewire::test(EditSiteMedia::class, ['record' => $this->media('hero.shuba')->getRouteKey()])
            ->fillForm(['image' => UploadedFile::fake()->image('small.jpg', 900, 600)])
            ->call('save')
            ->assertHasFormErrors(['image']);

        $this->assertNull($this->media('hero.shuba')->image);
    }

    public function test_big_enough_photo_is_saved_from_the_form(): void
    {
        $this->actingAs(User::factory()->editor()->create());

        Livewire::test(EditSiteMedia::class, ['record' => $this->media('service.tekstil')->getRouteKey()])
            ->fillForm(['image' => UploadedFile::fake()->image('tekstil.jpg', 1000, 1250), 'alt' => 'Бельё'])
            ->call('save')
            ->assertHasNoFormErrors();

        $media = $this->media('service.tekstil');
        $this->assertNotNull($media->image);
        Storage::disk('public')->assertExists($media->image);
        $this->assertSame('Бельё', $media->alt);
    }
}
