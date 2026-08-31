<?php

namespace App\Filament\Resources\Posts\Schemas;

use App\Enums\Rubric;
use App\Models\Post;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Материал')
                    ->description('Заголовок, рубрика и текст — то, что увидит читатель.')
                    ->schema([
                        TextInput::make('title')
                            ->label('Заголовок')
                            ->required()
                            ->maxLength(180)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function (?string $state, callable $get, callable $set): void {
                                // Адрес правится вручную, но однажды заданный не перебиваем:
                                // у опубликованного материала смена адреса ломает ссылки.
                                if (filled($get('slug'))) {
                                    return;
                                }
                                $set('slug', Str::slug((string) $state, '-', 'ru'));
                            }),

                        TextInput::make('slug')
                            ->label('Адрес страницы')
                            ->helperText('Латиницей. Часть ссылки: bleskvip.ru/blog/адрес')
                            ->required()
                            ->maxLength(180)
                            ->unique(Post::class, ignoreRecord: true)
                            ->rule('regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'),

                        Select::make('rubric')
                            ->label('Рубрика')
                            ->options(Rubric::options())
                            ->default(Rubric::News->value)
                            ->required()
                            ->native(false),

                        Textarea::make('excerpt')
                            ->label('Анонс')
                            ->helperText('Две-три строки для карточки в списке и для описания в поиске.')
                            ->required()
                            ->rows(3)
                            ->maxLength(400),

                        RichEditor::make('body')
                            ->label('Текст')
                            ->required()
                            ->columnSpanFull(),
                    ]),

                Section::make('Обложка')
                    ->description('Необязательна: без неё карточка соберётся на фирменной плашке.')
                    ->schema([
                        FileUpload::make('cover_path')
                            ->label('Изображение')
                            ->image()
                            ->imageEditor()
                            ->directory('posts')
                            ->visibility('public')
                            ->maxSize(4096),

                        TextInput::make('cover_alt')
                            ->label('Описание изображения')
                            ->helperText('Что на снимке — для незрячих читателей и поиска.')
                            ->maxLength(180),
                    ]),

                Section::make('Публикация и поиск')
                    ->schema([
                        DateTimePicker::make('published_at')
                            ->label('Опубликовать')
                            ->helperText('Пусто — черновик. Дата в будущем — материал выйдет сам.')
                            ->seconds(false)
                            ->native(false),

                        TextInput::make('seo_title')
                            ->label('Заголовок для поиска')
                            ->helperText('Пусто — возьмётся обычный заголовок.')
                            ->maxLength(180),

                        Textarea::make('seo_description')
                            ->label('Описание для поиска')
                            ->helperText('Пусто — возьмётся анонс.')
                            ->rows(2)
                            ->maxLength(300),
                    ])
                    ->columns(1),
            ]);
    }
}
