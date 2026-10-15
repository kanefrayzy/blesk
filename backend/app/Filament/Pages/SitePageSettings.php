<?php

namespace App\Filament\Pages;

use App\Models\SitePage;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

/** Страница сайта целиком, одной формой. Содержимое — JSON в site_pages. */
abstract class SitePageSettings extends Page
{
    protected static string|UnitEnum|null $navigationGroup = 'Сайт';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    abstract protected static function pageKey(): string;

    abstract protected static function sitePath(): string;

    /** @return array<int, mixed> */
    abstract protected function fields(): array;

    public function mount(): void
    {
        $this->form->fill(SitePage::contentOf(static::pageKey()));
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components($this->fields())->statePath('data');
    }

    public function content(Schema $schema): Schema
    {
        return $schema->components([
            Form::make([EmbeddedSchema::make('form')])
                ->id('form')
                ->livewireSubmitHandler('save')
                ->footer([
                    Actions::make([
                        Action::make('save')->label('Сохранить')->submit('save')->keyBindings(['mod+s']),
                    ])->sticky(),
                ]),
        ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('open')
                ->label('Открыть на сайте')
                ->icon(Heroicon::OutlinedArrowTopRightOnSquare)
                ->color('gray')
                ->url(rtrim((string) config('services.next.site_url'), '/').static::sitePath(), shouldOpenInNewTab: true),
        ];
    }

    public function save(): void
    {
        $page = SitePage::query()->firstOrNew(['key' => static::pageKey()]);
        $page->content = array_replace($page->content ?? [], $this->form->getState());
        $page->save();

        Notification::make()->title('Сохранено, на сайте обновится через несколько секунд')->success()->send();
    }
}
