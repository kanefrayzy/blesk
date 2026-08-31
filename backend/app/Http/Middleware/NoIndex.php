<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Закрывает бэкенд от поисковиков.
 *
 * Заголовком, а не строкой в robots.txt: адрес панели неугадываемый, и
 * писать его в общедоступный файл значит его же и раскрыть.
 */
class NoIndex
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive');

        return $response;
    }
}
