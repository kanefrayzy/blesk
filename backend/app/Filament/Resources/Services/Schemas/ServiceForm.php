<?php

namespace App\Filament\Resources\Services\Schemas;

use App\Filament\Support\ContentFields;
use App\Models\Service;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ServiceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make()
                    ->persistTabInQueryString()
                    ->columnSpanFull()
                    ->tabs([
                        Tab::make('Карточка')
                            ->schema([
                                Grid::make(['default' => 1, 'md' => 2])->schema([
                                    TextInput::make('name')
                                        ->label('Название')
                                        ->helperText('Как в карточке на главной и в меню.')
                                        ->required()
                                        ->maxLength(120)
                                        ->live(onBlur: true)
                                        ->afterStateUpdated(function (?string $state, callable $get, callable $set): void {
                                            if (blank($get('slug'))) {
                                                $set('slug', Str::slug((string) $state, '-', 'ru'));
                                            }
                                        }),
                                    TextInput::make('slug')
                                        ->label('Адрес страницы')
                                        ->prefix('bleskvip.ru/uslugi/')
                                        ->helperText('Латиницей. У опубликованной услуги лучше не менять: старые ссылки перестанут работать.')
                                        ->required()
                                        ->maxLength(120)
                                        ->unique(Service::class, ignoreRecord: true)
                                        ->rule('regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'),
                                    TextInput::make('note')
                                        ->label('Подпись в карточке')
                                        ->required()
                                        ->maxLength(200),
                                    ContentFields::icon()->required(),
                                ]),
                                ContentFields::image('card_photo', 'Фото карточки', 'Вертикальный кадр, пропорции примерно 4:5.'),
                                Toggle::make('is_active')->label('Показывать на сайте')->default(true),
                            ]),

                        Tab::make('Первый экран')
                            ->schema([
                                TextInput::make('title')->label('Заголовок страницы')->required()->maxLength(200),
                                Textarea::make('lead')->label('Подзаголовок')->required()->rows(2)->maxLength(400),
                                Grid::make(['default' => 1, 'md' => 3])->schema([
                                    TextInput::make('price')
                                        ->label('Цена крупно')
                                        ->placeholder('от 700 ₽')
                                        ->helperText('Пусто — «считаем по заявке».')
                                        ->maxLength(60),
                                    TextInput::make('price_note')->label('Подпись к цене')->placeholder('рубашка, сорочка')->maxLength(160),
                                    TextInput::make('cta')->label('Текст кнопки')->default('Узнать стоимость')->required()->maxLength(60),
                                ]),
                                ContentFields::image('hero_photo', 'Фото', 'Горизонтальный кадр 4:3.'),
                                TextInput::make('hero_alt')->label('Что на фото')->helperText('Для поиска и незрячих посетителей.')->maxLength(200),
                            ]),

                        Tab::make('Стоимость')
                            ->schema([
                                Repeater::make('prices')
                                    ->label('Цены')
                                    ->schema([
                                        TextInput::make('item')->label('Изделие')->required()->maxLength(120),
                                        TextInput::make('price')->label('Цена')->placeholder('от 1 500 ₽')->required()->maxLength(60),
                                    ])
                                    ->columns(2)
                                    ->default([])
                                    ->addActionLabel('Добавить цену')
                                    ->helperText('Пусто — вместо таблицы покажем «стоимость считаем по заявке».')
                                    ->reorderableWithButtons()
                                    ->collapsible(),
                                Textarea::make('price_text')->label('Текст под ценами')->rows(2)->maxLength(400),
                                Repeater::make('factors')
                                    ->label('От чего зависит цена')
                                    ->simple(TextInput::make('value')->required()->maxLength(120))
                                    ->default([])
                                    ->addActionLabel('Добавить пункт'),
                            ]),

                        Tab::make('Риски')
                            ->schema([
                                TextInput::make('risk_title')->label('Заголовок блока')->default('Чем рискует вещь дома')->required()->maxLength(160),
                                Textarea::make('risk_punch')->label('Вывод под заголовком')->rows(2)->maxLength(400),
                                Repeater::make('risk_items')
                                    ->label('Риски')
                                    ->schema([
                                        TextInput::make('name')->label('Что')->required()->maxLength(80),
                                        TextInput::make('text')->label('Что случится')->required()->maxLength(120),
                                        ContentFields::icon()->required(),
                                    ])
                                    ->columns(3)
                                    ->default([])
                                    ->addActionLabel('Добавить риск')
                                    ->reorderableWithButtons(),
                            ]),

                        Tab::make('Что делаем мы')
                            ->schema([
                                Repeater::make('steps')
                                    ->label('Шаги')
                                    ->schema([
                                        TextInput::make('name')->label('Шаг')->required()->maxLength(120),
                                        TextInput::make('text')->label('Пояснение')->maxLength(200),
                                    ])
                                    ->columns(2)
                                    ->default([])
                                    ->addActionLabel('Добавить шаг')
                                    ->reorderableWithButtons(),
                                Textarea::make('result')->label('Результат — строка под шагами')->rows(2)->maxLength(300),
                                Section::make('Фото блока')
                                    ->schema([
                                        ContentFields::image('process_photo', 'Фото', 'Почти квадратный кадр.'),
                                        Grid::make(['default' => 1, 'md' => 2])->schema([
                                            TextInput::make('process_name')->label('Подпись на фото')->maxLength(120),
                                            TextInput::make('process_note')->label('Строка под подписью')->maxLength(200),
                                        ]),
                                    ]),
                            ]),

                        Tab::make('Заявка и поиск')
                            ->schema([
                                Select::make('form')
                                    ->label('Форма внизу страницы')
                                    ->options([
                                        'order' => 'Обычная заявка на чистку',
                                        'business' => 'Коммерческое предложение для организаций',
                                    ])
                                    ->default('order')
                                    ->required()
                                    ->native(false),
                                TextInput::make('seo_title')->label('Заголовок для поиска')->helperText('Пусто — возьмём заголовок страницы.')->maxLength(200),
                                Textarea::make('seo_description')->label('Описание для поиска')->helperText('Пусто — возьмём подзаголовок.')->rows(2)->maxLength(300),
                            ]),
                    ]),
            ]);
    }
}
