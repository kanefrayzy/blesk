<?php

use App\Http\Controllers\Api\V1\CabinetAuthController;
use App\Http\Controllers\Api\V1\CabinetController;
use App\Http\Controllers\Api\V1\OrderRequestController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\PushSubscriptionController;
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

    Route::prefix('cabinet')->group(function (): void {
        Route::post('identify', [CabinetAuthController::class, 'identify'])->middleware('throttle:3,1');
        Route::post('login', [CabinetAuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('remember-password', [CabinetAuthController::class, 'remember'])->middleware('throttle:1,5');
        Route::post('logout', [CabinetAuthController::class, 'logout'])->middleware('throttle:10,1');
        Route::get('dashboard', [CabinetController::class, 'dashboard'])->middleware('throttle:30,1');
        Route::patch('preferences', [CabinetController::class, 'preferences'])->middleware('throttle:10,1');
        Route::get('photos/{photoId}', [CabinetController::class, 'photo'])->middleware('throttle:60,1');
        Route::get('push/config', [PushSubscriptionController::class, 'config'])->middleware('throttle:30,1');
        Route::post('push/subscriptions', [PushSubscriptionController::class, 'store'])->middleware('throttle:10,1');
        Route::delete('push/subscriptions', [PushSubscriptionController::class, 'destroy'])->middleware('throttle:10,1');
    });
});
