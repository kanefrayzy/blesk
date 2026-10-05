<?php

namespace App\Filament\Resources\SiteMedia\Tables;

use App\Models\SiteMedia;
use App\Support\SiteMediaSlots;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Grouping\Group;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class SiteMediaTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query): Builder => $query->whereIn('key', array_keys(SiteMediaSlots::all())))
            ->defaultSort('sort')
            ->defaultGroup(
                Group::make('group')
                    ->label('Раздел')
                    ->titlePrefixedWithLabel(false)
                    ->getTitleFromRecordUsing(fn (SiteMedia $record): string => SiteMediaSlots::GROUPS[$record->group] ?? $record->group)
                    // Разделы идут в порядке страницы, а не по алфавиту.
                    ->orderQueryUsing(fn (Builder $query): Builder => $query->orderBy('sort')),
            )
            ->groupingSettingsHidden()
            ->paginated(false)
            ->columns([
                ImageColumn::make('preview')
                    ->label('')
                    ->state(fn (SiteMedia $record): string => $record->currentUrl())
                    ->imageHeight(64)
                    ->extraImgAttributes(['class' => 'rounded-lg object-cover', 'style' => 'width: 96px']),

                TextColumn::make('label')
                    ->label('Место')
                    ->state(fn (SiteMedia $record): string => $record->slot()['label'])
                    ->description(function (SiteMedia $record): string {
                        $frame = $record->slot()['frame'];

                        return sprintf('от %d px в ширину, пропорции %s', $frame['min'], SiteMediaSlots::ratioLabel($frame))
                            .($record->slot()['frame_mobile'] ? ' · есть кадр для телефона' : '');
                    }),

                TextColumn::make('state')
                    ->label('Фото')
                    ->badge()
                    ->state(fn (SiteMedia $record): string => $record->isCustom() ? 'Своё' : 'Стандартное')
                    ->color(fn (string $state): string => $state === 'Своё' ? 'success' : 'gray'),

                TextColumn::make('updated_at')
                    ->label('Изменено')
                    ->state(fn (SiteMedia $record) => $record->isCustom() ? $record->updated_at : null)
                    ->dateTime('d.m.Y H:i')
                    ->placeholder('—'),
            ])
            ->recordActions([
                EditAction::make()
                    ->label('Заменить')
                    ->icon(Heroicon::OutlinedPhoto),
            ]);
    }
}
