<?php

namespace App\Filament\Resources\SiteMedia\Pages;

use App\Filament\Resources\SiteMedia\SiteMediaResource;
use App\Models\SiteMedia;
use Filament\Resources\Pages\ListRecords;

class ListSiteMedia extends ListRecords
{
    protected static string $resource = SiteMediaResource::class;

    public function mount(): void
    {
        // Новое место из списка появляется в разделе само.
        SiteMedia::syncSlots();

        parent::mount();
    }

    public function getTitle(): string
    {
        return 'Фото на сайте';
    }

    public function getSubheading(): ?string
    {
        return 'Пока своё фото не загружено, на сайте стоит стандартное. Нажмите на место, чтобы заменить снимок.';
    }
}
