<?php

return [
    'base_url' => env('AGBIS_BASE_URL'),
    'timeout' => (int) env('AGBIS_TIMEOUT', 15),

    // Картинка с кодом лежит вне контура химчистки — адрес общий для всех.
    'captcha_url' => env(
        'AGBIS_CAPTCHA_URL',
        'https://himinfo.ru/him_general_php/api/captcha.php',
    ),

    // Сколько держим метку капчи у себя. У AGBIS она живёт 300 секунд.
    'captcha_ttl' => (int) env('AGBIS_CAPTCHA_TTL', 300),
    'cookie' => env('CABINET_COOKIE', 'blesk_cabinet'),
    'session_days' => (int) env('CABINET_SESSION_DAYS', 30),
];
