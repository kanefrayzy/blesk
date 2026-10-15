<?php

use App\Support\ContentSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /** Переносим в панель то, что было зашито в витрину. Повторный запуск ничего не дублирует. */
    public function up(): void
    {
        // В тестах наполнение зовут сами, на поддельном диске.
        if (! app()->runningUnitTests()) {
            (new ContentSeeder)->run();
        }
    }

    public function down(): void
    {
        //
    }
};
