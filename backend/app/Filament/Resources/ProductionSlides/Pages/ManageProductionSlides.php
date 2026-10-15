<?php

namespace App\Filament\Resources\ProductionSlides\Pages;

use App\Filament\Resources\ProductionSlides\ProductionSlideResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageProductionSlides extends ManageRecords
{
    protected static string $resource = ProductionSlideResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
