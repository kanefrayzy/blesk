<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SiteMedia;
use Illuminate\Http\JsonResponse;

class SiteMediaController extends Controller
{
    /**
     * Только заменённые места: про остальные витрина и так знает свои
     * стандартные снимки, а пустое место не должно их перебивать.
     */
    public function index(): JsonResponse
    {
        $data = [];

        SiteMedia::query()
            ->where(fn ($query) => $query->whereNotNull('image')->orWhereNotNull('image_mobile')->orWhereNotNull('alt'))
            ->orderBy('sort')
            ->get()
            ->each(function (SiteMedia $media) use (&$data): void {
                $data[$media->key] = [
                    'src' => $media->image ? SiteMedia::publicUrl($media->image) : null,
                    'src_mobile' => $media->image_mobile ? SiteMedia::publicUrl($media->image_mobile) : null,
                    'alt' => filled($media->alt) ? $media->alt : null,
                ];
            });

        // Пустой объект, а не пустой массив: витрина ждёт словарь.
        return response()
            ->json(['data' => (object) $data])
            ->header('Cache-Control', 'public, max-age=60');
    }
}
