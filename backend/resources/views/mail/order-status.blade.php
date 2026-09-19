@php
    $ready = $stage === 'ready';
    $steps = [['Принят', true], ['В работе', true], ['Готов', $ready]];
    $font = "'TikTok Sans',Arial,Helvetica,sans-serif";
@endphp
<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>{{ $heading }}</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f0;color:#0e1a35;font-family:{{ $font }}">
{{-- Строка превью в списке писем --}}
<div style="display:none;max-height:0;overflow:hidden">{{ $note }}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f5f0">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">

    <tr><td style="border-radius:20px 20px 0 0;background:#0e1a35;padding:26px 32px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td><a href="https://bleskvip.ru" style="color:#ffffff;text-decoration:none"><img src="https://bleskvip.ru/brand/email-logo.png" width="148" height="42" alt="Блеск" style="display:block;border:0;font-family:{{ $font }};font-size:26px;font-weight:700;line-height:42px;color:#ffffff"></a></td>
            <td align="right" style="font-family:{{ $font }};font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8a93a8">Личный кабинет</td>
        </tr></table>
    </td></tr>

    <tr><td style="background:#ffffff;padding:36px 32px 32px">
        <p style="margin:0 0 12px;font-family:{{ $font }};font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#14a4af">{{ $ready ? 'Можно забирать' : 'Статус заказа' }}</p>
        <h1 style="margin:0 0 12px;font-family:{{ $font }};font-size:28px;line-height:1.2;font-weight:700;letter-spacing:-.02em;color:#0e1a35">{{ $heading }}</h1>
        <p style="margin:0;font-family:{{ $font }};font-size:16px;line-height:1.55;color:#55607a">{{ $note }}</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0"><tr>
            @foreach ($steps as [$label, $done])
                <td width="33%" valign="top" style="padding:0 {{ $loop->last ? '0' : '6px' }} 0 0">
                    <div style="height:4px;border-radius:4px;background:{{ $done ? '#14a4af' : '#e2e5ea' }};font-size:0;line-height:0">&nbsp;</div>
                    <p style="margin:10px 0 0;font-family:{{ $font }};font-size:13px;font-weight:{{ $done ? '700' : '400' }};color:{{ $done ? '#0e1a35' : '#7b8499' }}">{{ $label }}</p>
                </td>
            @endforeach
        </tr></table>

        @if ($ready)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0"><tr>
                <td style="border-radius:14px;background:#f0e8d9;padding:18px 20px;font-family:{{ $font }}">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#55607a">Где забрать</p>
                    <p style="margin:0;font-size:15px;line-height:1.5;color:#0e1a35"><a href="https://yandex.ru/maps/org/blesk/1044852336/" style="color:#0e1a35;text-decoration:none">г.&nbsp;Жуковский, ул.&nbsp;Энергетическая,&nbsp;9</a><br>Часы работы 9:00 — 20:00</p>
                    <a href="https://yandex.ru/maps/org/blesk/1044852336/?rtext=~55.601529%2C38.114940&amp;rtt=auto" style="display:inline-block;margin-top:8px;font-size:14px;font-weight:700;color:#0e8d97;text-decoration:none">Построить маршрут →</a>
                </td>
            </tr></table>
        @endif

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 0"><tr>
            <td style="border-radius:999px;background:#14a4af">
                <a href="https://bleskvip.ru/lk" style="display:inline-block;padding:15px 30px;font-family:{{ $font }};font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#ffffff;text-decoration:none">Открыть кабинет</a>
            </td>
        </tr></table>
    </td></tr>

    <tr><td style="border-radius:0 0 20px 20px;background:#ffffff;border-top:1px solid #eef0f3;padding:22px 32px;font-family:{{ $font }};font-size:14px;line-height:1.6;color:#55607a">
        <a href="tel:+74955566250" style="color:#0e1a35;font-weight:700;text-decoration:none">+7 (495) 556-62-50</a>
        &nbsp;·&nbsp;
        <a href="tel:+79166959179" style="color:#0e1a35;font-weight:700;text-decoration:none">+7 (916) 695-91-79</a><br>
        <a href="https://bleskvip.ru" style="color:#55607a;text-decoration:none">bleskvip.ru</a>
        &nbsp;·&nbsp;
        <a href="mailto:info@bleskvip.ru" style="color:#55607a;text-decoration:none">info@bleskvip.ru</a>
    </td></tr>

    <tr><td style="padding:20px 32px 0;font-family:{{ $font }};font-size:12px;line-height:1.55;color:#7b8499">
        Письмо пришло, потому что в личном кабинете включены уведомления на почту.
        Выключить их можно в <a href="https://bleskvip.ru/lk" style="color:#7b8499">настройках кабинета</a>.
    </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
