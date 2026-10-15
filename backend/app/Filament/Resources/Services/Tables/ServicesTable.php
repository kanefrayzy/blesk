<?php

namespace App\Filament\Resources\Services\Tables;

use App\Models\Service;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class ServicesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort')
            ->reorderable('sort')
            ->columns([
                ImageColumn::make('card_photo')->label('')->disk('public')->imageSize(52),
                TextColumn::make('name')
                    ->label('Услуга')
                    ->searchable()
                    ->description(fn (Service $record): string => '/uslugi/'.$record->slug),
                TextColumn::make('price')->label('Цена')->placeholder('по заявке'),
                ToggleColumn::make('is_active')->label('На сайте'),
            ])
            ->recordActions([EditAction::make()])
            ->emptyStateHeading('Услуг пока нет');
    }
}
