<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Пользователей здесь нет намеренно: редактор заводится командой
     * `php artisan make:filament-user`, чтобы пароль не жил в репозитории.
     */
    public function run(): void
    {
        $this->call(PostSeeder::class);
    }
}
