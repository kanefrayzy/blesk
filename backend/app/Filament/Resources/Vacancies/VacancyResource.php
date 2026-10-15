<?php

namespace App\Filament\Resources\Vacancies;

use App\Filament\Resources\Vacancies\Pages\ManageVacancies;
use App\Filament\Support\ContentFields;
use App\Models\Vacancy;
use BackedEnum;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
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

class VacancyResource extends Resource
{
    protected static ?string $model = Vacancy::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBriefcase;

    protected static string|UnitEnum|null $navigationGroup = 'Сайт';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Вакансии';

    protected static ?string $modelLabel = 'вакансия';

    protected static ?string $pluralModelLabel = 'вакансии';

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('title')->label('Должность')->required()->maxLength(160),
            Textarea::make('summary')->label('Коротко о работе')->required()->rows(2)->maxLength(300),
            Grid::make(['default' => 1, 'md' => 2])->schema([
                ContentFields::image('photo', 'Фото в карточке', 'Горизонтальный кадр 3:2.'),
                Select::make('focus')
                    ->label('Какую часть фото показывать')
                    ->options([
                        'center 15%' => 'Верх',
                        'center 30%' => 'Чуть выше центра',
                        'center 45%' => 'Центр',
                        'center 70%' => 'Низ',
                    ])
                    ->default('center 45%')
                    ->native(false),
            ]),
            Grid::make(['default' => 1, 'md' => 2])->schema([
                Repeater::make('duties')
                    ->label('Обязанности')
                    ->simple(TextInput::make('value')->required()->maxLength(200))
                    ->default([])
                    ->addActionLabel('Добавить обязанность')
                    ->reorderableWithButtons(),
                Repeater::make('requirements')
                    ->label('Требования')
                    ->simple(TextInput::make('value')->required()->maxLength(200))
                    ->default([])
                    ->addActionLabel('Добавить требование')
                    ->reorderableWithButtons(),
            ]),
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
                TextColumn::make('title')->label('Должность')->searchable()->description(fn (Vacancy $record): string => $record->summary),
                ToggleColumn::make('is_active')->label('На сайте'),
            ])
            ->recordActions([EditAction::make()->slideOver(), DeleteAction::make()])
            ->emptyStateHeading('Вакансий пока нет');
    }

    public static function getPages(): array
    {
        return ['index' => ManageVacancies::route('/')];
    }
}
