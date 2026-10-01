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
        ->middleware('throttle:5,1,OrderRequest.store')
        ->name('api.v1.order-requests.store');

    // У каждого маршрута свой счётчик: без префикса Laravel считает все
    // throttle по одному IP вместе, и обычный вход упирался в лимит.
    Route::prefix('cabinet')->group(function (): void {
        Route::post('check-phone', [CabinetAuthController::class, 'checkPhone'])->middleware('throttle:10,1,CabinetAuth.checkPhone');
        Route::get('captcha', [CabinetAuthController::class, 'captcha'])->middleware('throttle:20,1,CabinetAuth.captcha');
        Route::post('send-code', [CabinetAuthController::class, 'sendCode'])->middleware('throttle:6,1,CabinetAuth.sendCode');
        Route::post('login', [CabinetAuthController::class, 'login'])->middleware('throttle:10,1,CabinetAuth.login');
        Route::post('logout', [CabinetAuthController::class, 'logout'])->middleware('throttle:10,1,CabinetAuth.logout');
        Route::get('dashboard', [CabinetController::class, 'dashboard'])->middleware('throttle:30,1,Cabinet.dashboard');
        Route::patch('preferences', [CabinetController::class, 'preferences'])->middleware('throttle:10,1,Cabinet.preferences');
        Route::post('notifications-prompt/dismiss', [CabinetController::class, 'dismissNotificationsPrompt'])->middleware('throttle:10,1,Cabinet.dismissNotificationsPrompt');
        Route::get('orders/{orderId}/photos', [CabinetController::class, 'orderPhotos'])->middleware('throttle:30,1,Cabinet.orderPhotos');
        Route::get('photos/{photoId}', [CabinetController::class, 'photo'])->middleware('throttle:60,1,Cabinet.photo');
        Route::get('push/config', [PushSubscriptionController::class, 'config'])->middleware('throttle:30,1,PushSubscription.config');
        Route::post('push/subscriptions', [PushSubscriptionController::class, 'store'])->middleware('throttle:10,1,PushSubscription.store');
        Route::delete('push/subscriptions', [PushSubscriptionController::class, 'destroy'])->middleware('throttle:10,1,PushSubscription.destroy');
    });
});
