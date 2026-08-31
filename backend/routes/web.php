<?php

use Illuminate\Support\Facades\Route;

// У бэкенда нет своей витрины: корень уводит редактора в панель.
Route::redirect('/', '/'.config('panel.path'));
