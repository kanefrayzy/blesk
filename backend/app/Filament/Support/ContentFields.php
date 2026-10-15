<?php

namespace App\Filament\Support;

use App\Support\ContentImage;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Illuminate\Validation\ValidationException;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use RuntimeException;

class ContentFields
{
    /** Оригинал до 40 МБ: при сохранении ужимаем до ширины сайта. */
    public static function image(string $name, string $label, string $hint = ''): FileUpload
    {
        return FileUpload::make($name)
            ->label($label)
            ->disk('public')
            ->directory(ContentImage::DIRECTORY)
            ->visibility('public')
            ->image()
            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
            ->maxSize(40960)
            ->imageEditor()
            ->imagePreviewHeight('200')
            ->helperText(trim('JPG, PNG или WebP до 40 МБ — можно сразу с фотоаппарата, сайт сам уменьшит снимок. '.$hint))
            ->saveUploadedFileUsing(function (TemporaryUploadedFile $file) use ($name): string {
                try {
                    return ContentImage::store($file->getRealPath());
                } catch (RuntimeException $exception) {
                    throw ValidationException::withMessages([$name => $exception->getMessage()]);
                }
            });
    }

    /** Список строк в JSON, в форме — по строке на пункт. */
    public static function lines(string $name, string $label): Textarea
    {
        return Textarea::make($name)
            ->label($label)
            ->helperText('Каждая строка — отдельная строка на сайте.')
            ->rows(2)
            ->formatStateUsing(fn (mixed $state): string => is_array($state) ? implode("\n", $state) : (string) $state)
            ->dehydrateStateUsing(fn (?string $state): array => array_values(array_filter(array_map('trim', preg_split('/\R/u', (string) $state)))));
    }

    public static function icon(string $name = 'icon', string $label = 'Иконка'): Select
    {
        return Select::make($name)
            ->label($label)
            ->options(self::icons())
            ->allowHtml()
            ->searchable()
            ->native(false);
    }

    /** @return array<string, string> */
    private static function icons(): array
    {
        $site = rtrim((string) config('services.next.site_url'), '/');
        $options = [];

        foreach (glob(dirname(base_path()).'/public/icons/*.svg') ?: [] as $file) {
            $name = basename($file);
            $options[$name] = sprintf(
                '<span style="display:flex;align-items:center;gap:.6rem"><img src="%s/icons/%s" alt="" style="width:1.6rem;height:1.6rem">%s</span>',
                e($site),
                e($name),
                e(pathinfo($name, PATHINFO_FILENAME)),
            );
        }

        return $options;
    }
}
