<?php

namespace App\Filament\Resources\Posts\Tables;

use App\Enums\Rubric;
use App\Models\Post;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('published_at', 'desc')
            ->columns([
                ImageColumn::make('cover_path')
                    ->label('')
                    ->disk('public')
                    ->imageSize(44),

                TextColumn::make('title')
                    ->label('Заголовок')
                    ->searchable()
                    ->wrap()
                    ->description(fn (Post $record): string => '/blog/'.$record->slug),

                TextColumn::make('rubric')
                    ->label('Рубрика')
                    ->badge(),

                TextColumn::make('published_at')
                    ->label('Публикация')
                    ->dateTime('d.m.Y H:i')
                    ->placeholder('черновик')
                    ->sortable(),

                TextColumn::make('state')
                    ->label('Статус')
                    ->badge()
                    ->state(fn (Post $record): string => match (true) {
                        $record->published_at === null => 'Черновик',
                        $record->published_at->isFuture() => 'Запланирован',
                        default => 'Опубликован',
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'Опубликован' => 'success',
                        'Запланирован' => 'warning',
                        default => 'gray',
                    }),
            ])
            ->filters([
                SelectFilter::make('rubric')
                    ->label('Рубрика')
                    ->options(Rubric::options()),

                TernaryFilter::make('published')
                    ->label('Опубликованные')
                    ->placeholder('Все')
                    ->trueLabel('Только опубликованные')
                    ->falseLabel('Только черновики')
                    ->queries(
                        true: fn (Builder $query) => $query->published(),
                        false: fn (Builder $query) => $query->where(
                            fn (Builder $q) => $q->whereNull('published_at')->orWhere('published_at', '>', now()),
                        ),
                        blank: fn (Builder $query) => $query,
                    ),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('Материалов пока нет')
            ->emptyStateDescription('Первая новость появится здесь, как только вы её создадите.');
    }
}
