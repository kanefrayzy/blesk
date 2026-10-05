<?php

namespace App\Filament\Resources\SiteMedia;

use App\Filament\Resources\SiteMedia\Pages\EditSiteMedia;
use App\Filament\Resources\SiteMedia\Pages\ListSiteMedia;
use App\Filament\Resources\SiteMedia\Schemas\SiteMediaForm;
use App\Filament\Resources\SiteMedia\Tables\SiteMediaTable;
use App\Models\SiteMedia;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * Фотографии на местах сайта. Места заданы вёрсткой, поэтому здесь нельзя
 * ни добавить, ни удалить — только заменить снимок или вернуть стандартный.
 */
class SiteMediaResource extends Resource
{
    protected static ?string $model = SiteMedia::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhoto;

    protected static ?string $navigationLabel = 'Фото на сайте';

    protected static ?string $modelLabel = 'фото';

    protected static ?string $pluralModelLabel = 'фото на сайте';

    protected static ?string $slug = 'site-media';

    // По-русски с заглавной только первое слово: «Фото на сайте», а не «Фото На Сайте».
    protected static bool $hasTitleCaseModelLabel = false;

    protected static ?string $breadcrumb = 'Фото на сайте';

    public static function getRecordTitle(?Model $record): string
    {
        return $record instanceof SiteMedia ? $record->slot()['label'] : 'Фото';
    }

    public static function form(Schema $schema): Schema
    {
        return SiteMediaForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SiteMediaTable::configure($table);
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function canDeleteAny(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSiteMedia::route('/'),
            'edit' => EditSiteMedia::route('/{record}/edit'),
        ];
    }
}
