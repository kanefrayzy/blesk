<?php

namespace App\Filament\Pages;

use App\Filament\Support\ContentFields;
use App\Models\SitePage;
use BackedEnum;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Support\Icons\Heroicon;

class VacanciesPageSettings extends SitePageSettings
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserGroup;

    protected static ?int $navigationSort = 6;

    protected static ?string $navigationLabel = 'Страница «Вакансии»';

    protected static ?string $title = 'Страница «Вакансии»';

    protected static ?string $slug = 'page-vacancies';

    protected static function pageKey(): string
    {
        return SitePage::VACANCIES;
    }

    protected static function sitePath(): string
    {
        return '/vakansii';
    }

    protected function fields(): array
    {
        return [
            Section::make('Первый экран')->collapsible()
                ->description('Сами вакансии — в разделе «Вакансии».')
                ->schema([
                    Grid::make(['default' => 1, 'md' => 2])->schema([
                        ContentFields::lines('titleLines', 'Заголовок, белым'),
                        ContentFields::lines('accentLines', 'Продолжение, бирюзовым'),
                    ]),
                    Textarea::make('lead')->label('Подзаголовок')->rows(2)->required(),
                    Section::make('Фото')->statePath('heroPhoto')->schema([
                        ContentFields::image('src', 'Фото', 'Широкий горизонтальный кадр.'),
                        TextInput::make('alt')->label('Что на фото')->maxLength(200),
                    ]),
                ]),

            Section::make('Что мы предлагаем')->statePath('offers')->collapsible()->schema([
                TextInput::make('title')->label('Заголовок')->required(),
                Textarea::make('text')->label('Текст')->rows(2),
                Repeater::make('items')
                    ->label('Пункты')
                    ->schema([
                        TextInput::make('name')->label('Заголовок')->required()->maxLength(120),
                        Textarea::make('text')->label('Текст')->rows(2)->maxLength(300),
                        ContentFields::icon()->required(),
                    ])
                    ->columns(3)
                    ->default([])
                    ->addActionLabel('Добавить пункт')
                    ->reorderableWithButtons(),
            ]),

            Section::make('Список вакансий')->statePath('list')->collapsible()->schema([
                TextInput::make('title')->label('Заголовок')->required(),
                Section::make('Плашка про график и зарплату')->statePath('terms')->schema([
                    TextInput::make('title')->label('Заголовок'),
                    Textarea::make('text')->label('Текст')->rows(2),
                ]),
            ]),

            Section::make('Где вы будете работать')->statePath('place')->collapsible()->schema([
                TextInput::make('title')->label('Заголовок')->required(),
                Textarea::make('text')->label('Текст')->rows(2),
                Repeater::make('shots')
                    ->label('Фото')
                    ->schema([
                        ContentFields::image('src', 'Фото')->required(),
                        TextInput::make('name')->label('Подпись')->required(),
                    ])
                    ->grid(2)
                    ->default([])
                    ->addActionLabel('Добавить фото')
                    ->reorderableWithButtons(),
            ]),

            Section::make('Отклик')->statePath('reply')->collapsible()->schema([
                TextInput::make('title')->label('Заголовок')->required(),
                Textarea::make('text')->label('Текст')->rows(2),
            ]),

            Section::make('Поиск')->collapsed()->schema([
                TextInput::make('seoTitle')->label('Заголовок для поиска')->required()->maxLength(200),
                Textarea::make('seoDescription')->label('Описание для поиска')->rows(2)->maxLength(300),
            ]),
        ];
    }
}
