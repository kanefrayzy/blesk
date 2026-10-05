<?php

namespace App\Filament\Resources\SiteMedia\Pages;

use App\Filament\Resources\SiteMedia\SiteMediaResource;
use App\Models\SiteMedia;
use App\Support\SiteMediaSlots;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Icons\Heroicon;

/**
 * @property SiteMedia $record
 */
class EditSiteMedia extends EditRecord
{
    protected static string $resource = SiteMediaResource::class;

    public function getTitle(): string
    {
        return $this->record->slot()['label'];
    }

    public function getBreadcrumb(): string
    {
        return 'Замена фото';
    }

    public function getSubheading(): ?string
    {
        return SiteMediaSlots::GROUPS[$this->record->group] ?? null;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('reset')
                ->label('Вернуть стандартное фото')
                ->icon(Heroicon::OutlinedArrowUturnLeft)
                ->color('gray')
                ->visible(fn (): bool => $this->record->isCustom() || filled($this->record->alt))
                ->requiresConfirmation()
                ->modalHeading('Вернуть стандартное фото?')
                ->modalDescription('Загруженные снимки удалятся, на сайте снова будет стандартное фото.')
                ->modalSubmitActionLabel('Вернуть')
                ->action(function (): void {
                    $this->record->update(['image' => null, 'image_mobile' => null, 'alt' => null]);
                    $this->fillForm();

                    Notification::make()
                        ->success()
                        ->title('Стандартное фото вернулось на сайт')
                        ->send();
                }),
        ];
    }

    protected function getSavedNotificationTitle(): ?string
    {
        return 'Сохранено';
    }

    protected function getSavedNotificationMessage(): ?string
    {
        return 'Новое фото появится на сайте в течение минуты.';
    }

    protected function getRedirectUrl(): ?string
    {
        return static::getResource()::getUrl('index');
    }
}
