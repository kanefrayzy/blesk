<?php

namespace App\Filament\Resources\SiteMedia\Schemas;

use App\Models\SiteMedia;
use App\Services\SiteImageProcessor;
use App\Support\SiteMediaSlots;
use Closure;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Image;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class SiteMediaForm
{
    /** Лимит Livewire на временную загрузку — 12 МБ, берём с запасом. */
    private const MAX_KB = 10240;

    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Сейчас на сайте')
                    ->schema([
                        Grid::make(['default' => 1, 'md' => 2])->schema([
                            Image::make(
                                fn (SiteMedia $record): string => $record->currentUrl(),
                                fn (SiteMedia $record): string => $record->slot()['label'],
                            )
                                ->imageHeight(220),

                            Image::make(
                                fn (SiteMedia $record): string => (string) $record->currentMobileUrl(),
                                fn (SiteMedia $record): string => $record->slot()['label'].' — телефон',
                            )
                                ->imageHeight(220)
                                ->visible(fn (SiteMedia $record): bool => $record->slot()['frame_mobile'] !== null),
                        ]),
                    ])
                    ->description(fn (SiteMedia $record): string => $record->isCustom()
                        ? 'Своё фото. Новое заменит его после сохранения.'
                        : 'Стандартное фото. Загрузите своё, чтобы заменить его.'),

                Section::make('Новое фото')
                    ->schema([
                        self::upload('image', 'frame')
                            ->label(fn (SiteMedia $record): string => $record->slot()['frame_mobile'] ? 'Для компьютера' : 'Фото'),

                        self::upload('image_mobile', 'frame_mobile')
                            ->label('Для телефона')
                            ->visible(fn (SiteMedia $record): bool => $record->slot()['frame_mobile'] !== null),

                        TextInput::make('alt')
                            ->label('Что на снимке')
                            ->helperText('Для поиска и незрячих посетителей. Пусто — останется подпись стандартного фото.')
                            ->placeholder(fn (SiteMedia $record): string => $record->slot()['default_alt'])
                            ->maxLength(180),
                    ]),
            ])
            ->columns(1);
    }

    private static function upload(string $field, string $frameKey): FileUpload
    {
        return FileUpload::make($field)
            // Диск явно: снимки должны лежать в публичном хранилище, как бы
            // ни был настроен FILESYSTEM_DISK.
            ->disk('public')
            ->directory(SiteMedia::DIRECTORY)
            ->visibility('public')
            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->maxSize(self::MAX_KB)
            ->imageEditor()
            ->imageEditorAspectRatioOptions(function (SiteMedia $record) use ($frameKey): array {
                $f = $record->slot()[$frameKey];

                return $f ? [$f['ratio'][0].':'.$f['ratio'][1]] : [];
            })
            ->imagePreviewHeight('220')
            ->helperText(function (SiteMedia $record) use ($frameKey): string {
                $f = $record->slot()[$frameKey];

                if ($f === null) {
                    return '';
                }

                return sprintf(
                    'JPG, PNG или WebP до 10 МБ, не меньше %d × %d px. Сайт обрежет снимок по центру под пропорции %s — '
                    .'чтобы выбрать кадр самим, нажмите на карандаш на снимке и выберите эти пропорции.%s',
                    $f['min'],
                    SiteMediaSlots::minHeight($f),
                    SiteMediaSlots::ratioLabel($f),
                    $frameKey === 'frame_mobile' ? ' Если не загрузить, на телефоне покажем фото для компьютера.' : '',
                );
            })
            ->rule(fn (SiteMedia $record): Closure => function (string $attribute, mixed $value, Closure $fail) use ($record, $frameKey): void {
                $f = $record->slot()[$frameKey];

                if (! $value instanceof TemporaryUploadedFile || $f === null) {
                    return;
                }

                $width = app(SiteImageProcessor::class)->croppedWidth($value->getRealPath(), $f);

                if ($width === null) {
                    $fail('Файл не похож на изображение.');

                    return;
                }

                if ($width < $f['min']) {
                    $fail(sprintf(
                        'Снимок слишком мелкий: после обрезки под пропорции %s останется %d px в ширину, нужно не меньше %d.',
                        SiteMediaSlots::ratioLabel($f),
                        $width,
                        $f['min'],
                    ));
                }
            });
    }
}
