<?php

namespace App\Providers;

use Filament\Support\Facades\FilamentTimezone;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // База живёт в UTC, а редактор — в Жуковском: панель показывает московское время.
        FilamentTimezone::set('Europe/Moscow');

        Model::shouldBeStrict($this->app->isLocal());
    }
}
