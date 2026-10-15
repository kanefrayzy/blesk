<?php

namespace App\Filament\Resources\HeroSlides;

use App\Filament\Resources\HeroSlides\Pages\ManageHeroSlides;
use App\Filament\Support\ContentFields;
use App\Models\HeroSlide;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use UnitEnum;

class HeroSlideResource extends Resource
{
    protected static ?string $model = HeroSlide::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static string|UnitEnum|null $navigationGroup = 'Сайт';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Первый экран главной';

    protected static ?string $modelLabel = 'слайд';

    protected static ?string $pluralModelLabel = 'слайды первого экрана';

    protected static bool $hasTitleCaseModelLabel = false;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('label')
                ->label('Название слайда')
                ->helperText('Подпись у переключателя слайдов.')
                ->required()
                ->maxLength(80),
            Grid::make(['default' => 1, 'md' => 2])->schema([
                Textarea::make('title')
                    ->label('Заголовок, белым')
                    ->helperText('Каждая строка — отдельная строка на сайте.')
                    ->required()
                    ->rows(2),
                Textarea::make('accent')
                    ->label('Продолжение, бирюзовым')
                    ->helperText('Каждая строка — отдельная строка на сайте.')
                    ->rows(2),
            ]),
            Textarea::make('note')->label('Описание под заголовком')->rows(2)->maxLength(300),
            TextInput::make('href')
                ->label('Куда ведёт «Узнать больше»')
                ->placeholder('/uslugi/odezhda')
                ->helperText('Пусто — к списку услуг на главной.')
                ->maxLength(200),
            Grid::make(['default' => 1, 'md' => 2])->schema([
                ContentFields::image('photo', 'Фото для компьютера', 'Горизонтальный кадр, примерно 4:3.')->required(),
                ContentFields::image('photo_mobile', 'Фото для телефона', 'Вертикальный кадр. Пусто — возьмём фото для компьютера.'),
            ]),
            TextInput::make('alt')->label('Что на фото')->maxLength(200),
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
                TextColumn::make('label')
                    ->label('Слайд')
                    ->description(fn (HeroSlide $record): string => str_replace("\n", ' ', trim($record->title.' '.$record->accent))),
                ToggleColumn::make('is_active')->label('На сайте'),
            ])
            ->recordActions([EditAction::make()->slideOver(), DeleteAction::make()])
            ->emptyStateHeading('Слайдов пока нет');
    }

    public static function getPages(): array
    {
        return ['index' => ManageHeroSlides::route('/')];
    }
}
