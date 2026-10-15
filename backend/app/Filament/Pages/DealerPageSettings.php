<?php

namespace App\Filament\Pages;

use App\Filament\Support\ContentFields;
use App\Models\SitePage;
use BackedEnum;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Support\Icons\Heroicon;

class DealerPageSettings extends SitePageSettings
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingStorefront;

    protected static ?int $navigationSort = 5;

    protected static ?string $navigationLabel = 'Страница «Дилерам»';

    protected static ?string $title = 'Страница «Дилерам»';

    protected static ?string $slug = 'page-dealers';

    protected static function pageKey(): string
    {
        return SitePage::DEALERS;
    }

    protected static function sitePath(): string
    {
        return '/dileram';
    }

    private static function pairs(string $name, string $label, string $add): Repeater
    {
        return Repeater::make($name)
            ->label($label)
            ->schema([
                TextInput::make('name')->label('Заголовок')->required()->maxLength(120),
                Textarea::make('text')->label('Текст')->rows(2)->maxLength(400),
            ])
            ->columns(2)
            ->default([])
            ->addActionLabel($add)
            ->reorderableWithButtons()
            ->collapsible();
    }

    protected function fields(): array
    {
        return [
            Section::make('Первый экран')->collapsible()->schema([
                Grid::make(['default' => 1, 'md' => 2])->schema([
                    ContentFields::lines('titleLines', 'Заголовок, белым'),
                    ContentFields::lines('accentLines', 'Продолжение, бирюзовым'),
                ]),
                Textarea::make('lead')->label('Подзаголовок')->rows(2)->required(),
                TextInput::make('cta')->label('Текст кнопки')->required()->maxLength(60),
                Section::make('Фото')->statePath('photo')->schema([
                    ContentFields::image('src', 'Фото', 'Широкий горизонтальный кадр.'),
                    TextInput::make('alt')->label('Что на фото')->maxLength(200),
                ]),
            ]),

            Section::make('Производство уже есть')->statePath('intro')->collapsible()->schema([
                TextInput::make('title')->label('Заголовок')->required(),
                Repeater::make('text')
                    ->label('Абзацы')
                    ->simple(Textarea::make('value')->rows(3)->required())
                    ->default([])
                    ->addActionLabel('Добавить абзац')
                    ->reorderableWithButtons(),
            ]),

            Section::make('Как это работает')->statePath('loop')->collapsible()->schema([
                TextInput::make('title')->label('Заголовок')->required(),
                Textarea::make('text')->label('Текст')->rows(2),
                Grid::make(['default' => 1, 'md' => 2])->schema([
                    Section::make('Ваш пункт')->statePath('point')->schema([
                        TextInput::make('name')->label('Подпись')->required(),
                        Textarea::make('text')->label('Текст')->rows(2),
                        ContentFields::image('photo', 'Фото'),
                        TextInput::make('alt')->label('Что на фото'),
                    ]),
                    Section::make('Наш цех')->statePath('shop')->schema([
                        TextInput::make('name')->label('Подпись')->required(),
                        Textarea::make('text')->label('Текст')->rows(2),
                        ContentFields::image('photo', 'Фото'),
                        TextInput::make('alt')->label('Что на фото'),
                    ]),
                ]),
                Grid::make(['default' => 1, 'md' => 2])->schema([
                    TextInput::make('there')->label('Стрелка «туда»')->required(),
                    TextInput::make('back')->label('Стрелка «обратно»')->required(),
                ]),
                self::pairs('steps', 'Шаги', 'Добавить шаг'),
            ]),

            Section::make('От вас и от нас')->collapsible()->schema([
                self::pairs('yours', 'От вас', 'Добавить пункт'),
                self::pairs('ours', 'От нас', 'Добавить пункт'),
            ]),

            Section::make('Что принимает ваш пункт')->statePath('accepts')->collapsible()
                ->description('Карточки услуг берутся из раздела «Услуги».')
                ->schema([
                    TextInput::make('title')->label('Заголовок')->required(),
                    Textarea::make('text')->label('Текст')->rows(2),
                ]),

            Section::make('Кто придёт в ваш пункт')->statePath('audience')->collapsible()->schema([
                TextInput::make('title')->label('Заголовок')->required(),
                self::pairs('items', 'Аудитория', 'Добавить'),
            ]),

            Section::make('Фирменный стиль')->statePath('brand')->collapsible()->schema([
                TextInput::make('title')->label('Заголовок')->required(),
                Textarea::make('text')->label('Текст')->rows(2),
                Repeater::make('items')
                    ->label('Макеты')
                    ->schema([
                        ContentFields::image('src', 'Изображение', 'Квадрат.')->required(),
                        TextInput::make('name')->label('Подпись')->required(),
                    ])
                    ->grid(2)
                    ->default([])
                    ->addActionLabel('Добавить макет')
                    ->reorderableWithButtons(),
            ]),

            Section::make('Цех уже построен')->statePath('production')->collapsible()
                ->description('Фото берутся из раздела «О нас: производство».')
                ->schema([
                    TextInput::make('title')->label('Заголовок')->required(),
                    Textarea::make('text')->label('Текст')->rows(2),
                ]),

            Section::make('Доход и города')->collapsible()->schema([
                TextInput::make('promise')->label('Обещание крупно')->required(),
                Textarea::make('money.text')->label('Про доход')->rows(3),
                TagsInput::make('cities')->label('Города')->placeholder('Добавить город'),
            ]),

            Section::make('Поиск')->collapsed()->schema([
                TextInput::make('seoTitle')->label('Заголовок для поиска')->required()->maxLength(200),
                Textarea::make('seoDescription')->label('Описание для поиска')->rows(2)->maxLength(300),
            ]),
        ];
    }
}
