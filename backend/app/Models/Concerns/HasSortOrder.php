<?php

namespace App\Models\Concerns;

/** Новая запись встаёт в конец списка. */
trait HasSortOrder
{
    public static function bootHasSortOrder(): void
    {
        static::creating(function ($model): void {
            if (! $model->sort) {
                $model->sort = (int) static::query()->max('sort') + 1;
            }
        });
    }
}
