<?php

return [
    'base_url' => env('AGBIS_BASE_URL'),
    'timeout' => (int) env('AGBIS_TIMEOUT', 15),
    'cookie' => env('CABINET_COOKIE', 'blesk_cabinet'),
    'session_days' => (int) env('CABINET_SESSION_DAYS', 30),
];
