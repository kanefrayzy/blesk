<?php

use App\Http\Controllers\Api\V1\OrderRequestController;
use App\Http\Controllers\Api\V1\PostController;
use Illuminate\Support\Facades\Route;

/**
 * Публичное чтение материалов для витрины на Next.js. Только GET и только
 * опубликованное: запись идёт через панель, а не через API.
 */
Route::prefix('v1')->group(function (): void {
    Route::get('posts', [PostController::class, 'index'])->name('api.v1.posts.index');
    Route::get('posts/{post:slug}', [PostController::class, 'show'])->name('api.v1.posts.show');
    Route::post('order-requests', [OrderRequestController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('api.v1.order-requests.store');
});
