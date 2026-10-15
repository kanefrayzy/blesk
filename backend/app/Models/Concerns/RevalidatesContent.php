<?php

namespace App\Models\Concerns;

use App\Services\NextRevalidator;
use Illuminate\Support\Facades\DB;

/** После правки в панели витрина сразу забывает закэшированный контент. */
trait RevalidatesContent
{
    public static function bootRevalidatesContent(): void
    {
        $revalidate = fn () => DB::afterCommit(fn () => app(NextRevalidator::class)->revalidate('content'));

        static::saved($revalidate);
        static::deleted($revalidate);
    }
}
