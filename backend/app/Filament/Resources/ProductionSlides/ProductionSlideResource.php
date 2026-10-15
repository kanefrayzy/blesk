<?php

namespace App\Filament\Resources\ProductionSlides;

use App\Filament\Resources\ProductionSlides\Pages\ManageProductionSlides;
use App\Filament\Support\ContentFields;
use App\Models\ProductionSlide;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use UnitEnum;

class ProductionSlideResource extends Resource
{
    protected static ?string $model = ProductionSlide::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingOffice2;

    protected static string|UnitEnum|null $navigationGroup = 'Сайт';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'О нас: производство';

    protected static ?string $modelLabel = 'слайд';

    protected static ?string $pluralModelLabel = 'слайды «Наше производство»';

    protected static bool $hasTitleCaseModelLabel = false;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->label('Заголовок')->required()->maxLength(120),
            TextInput::make('note')->label('Описание')->maxLength(200),
            ContentFields::image('photo', 'Фото', 'Горизонтальный кадр 4:3.')->required(),
            Toggle::make('is_active')->label('Показывать на сайте')->default(true),
        ])->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('sort')
            ->reorderable('sort')
            ->columns([
                ImageColumn::make('photo')->label('')->disk('public')->imageHeight(52),
                TextColumn::make('name')->label('Слайд')->description(fn (ProductionSlide $record): string => (string) $record->note),
                ToggleColumn::make('is_active')->label('На сайте'),
            ])
            ->recordActions([EditAction::make()->slideOver(), DeleteAction::make()])
            ->emptyStateHeading('Слайдов пока нет');
    }

    public static function getPages(): array
    {
        return ['index' => ManageProductionSlides::route('/')];
    }
}
