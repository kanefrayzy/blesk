<?php

namespace Tests\Feature;

use App\Filament\Pages\DealerPageSettings;
use App\Models\HeroSlide;
use App\Models\Service;
use App\Models\SitePage;
use App\Models\User;
use App\Support\ContentImage;
use App\Support\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class SiteContentTest extends TestCase
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

        (new ContentSeeder)->run();
    }

    public function test_seeder_moves_the_site_into_the_panel_once(): void
    {
        (new ContentSeeder)->run();

        $this->assertSame(6, Service::query()->count());
        $this->assertSame(6, HeroSlide::query()->count());
        $this->assertSame(2, SitePage::query()->count());
        Storage::disk('public')->assertExists(Service::query()->value('card_photo'));
    }

    public function test_api_returns_content_in_the_shape_the_site_expects(): void
    {
        $data = $this->getJson('/api/v1/content')->assertOk()->json('data');

        $this->assertSame('odezhda', $data['services'][0]['slug']);
        $this->assertStringStartsWith(url('/storage/content/'), $data['services'][0]['cardPhoto']);
        $this->assertSame(['Химчистка', 'в Жуковском'], $data['heroSlides'][0]['title']);
        $this->assertSame('business', collect($data['services'])->firstWhere('slug', 'dlya-biznesa')['form']);
        $this->assertStringStartsWith(url('/storage/content/'), $data['dealerPage']['photo']['src']);
        $this->assertSame('Свой бизнес', $data['dealerPage']['titleLines'][0]);
        $this->assertCount(5, $data['vacancies']);
    }

    public function test_hidden_service_leaves_the_site(): void
    {
        Service::query()->where('slug', 'odezhda')->update(['is_active' => false]);

        $slugs = collect($this->getJson('/api/v1/content')->json('data.services'))->pluck('slug');

        $this->assertNotContains('odezhda', $slugs);
        $this->assertCount(5, $slugs);
    }

    public function test_saving_content_refreshes_the_site(): void
    {
        Http::fake();
        Service::query()->first()->update(['note' => 'Новая подпись']);

        Http::assertSent(fn (Request $request): bool => $request['tag'] === 'content');
    }

    public function test_big_photo_is_shrunk_to_site_width(): void
    {
        $image = imagecreatetruecolor(3200, 2000);
        $file = tempnam(sys_get_temp_dir(), 'img');
        imagejpeg($image, $file);

        $path = ContentImage::store($file);

        [$width, $height] = getimagesizefromstring(Storage::disk('public')->get($path));
        $this->assertSame([2560, 1600], [$width, $height]);
    }

    public function test_editor_opens_every_content_section(): void
    {
        $this->actingAs(User::factory()->editor()->create());
        $panel = '/'.config('panel.path');

        foreach (['services', 'hero-slides', 'production-slides', 'vacancies', 'page-dealers', 'page-vacancies'] as $section) {
            $this->get("$panel/$section")->assertOk();
        }

        $this->get("$panel/services/".Service::query()->value('id').'/edit')->assertOk();
        $this->get("$panel/services/create")->assertOk();
    }

    public function test_dealer_page_is_saved_from_the_panel(): void
    {
        $this->actingAs(User::factory()->editor()->create());

        Livewire::test(DealerPageSettings::class)
            ->fillForm(['lead' => 'Новый подзаголовок', 'cities' => ['Жуковский', 'Коломна']])
            ->call('save')
            ->assertHasNoFormErrors();

        $content = SitePage::contentOf(SitePage::DEALERS);
        $this->assertSame('Новый подзаголовок', $content['lead']);
        $this->assertSame(['Жуковский', 'Коломна'], $content['cities']);
        $this->assertSame(['Свой бизнес', 'в химчистке'], $content['titleLines']);
        $this->assertSame('dileram', $content['slug']);
    }
}
