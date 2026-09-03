<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Новая заявка с сайта</title>
</head>
<body style="margin:0;background:#f3f5f7;color:#0e1a35;font-family:Arial,sans-serif">
<div style="max-width:680px;margin:0 auto;padding:28px 16px">
    <div style="border-radius:16px;background:#ffffff;padding:28px">
        <p style="margin:0 0 8px;color:#14a4af;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Блеск · заявка с сайта</p>
        <h1 style="margin:0 0 24px;font-size:26px">{{ $order['service'] }}</h1>

        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5">
            <tr><td style="padding:8px 12px 8px 0;color:#7b8499">Клиент</td><td style="padding:8px 0;font-weight:700">{{ $order['name'] }}</td></tr>
            <tr><td style="padding:8px 12px 8px 0;color:#7b8499">Телефон</td><td style="padding:8px 0"><a href="tel:{{ $order['phone'] }}">{{ $order['phone'] }}</a></td></tr>
            <tr><td style="padding:8px 12px 8px 0;color:#7b8499">Почта</td><td style="padding:8px 0"><a href="mailto:{{ $order['email'] }}">{{ $order['email'] }}</a></td></tr>
            <tr><td style="padding:8px 12px 8px 0;color:#7b8499">Срочность</td><td style="padding:8px 0">{{ ['standard' => 'Без срочности', 'urgent_24h' => 'В течение суток', 'express_3h' => 'В течение 3 часов'][$order['urgency']] }}</td></tr>
            <tr><td style="padding:8px 12px 8px 0;color:#7b8499">Загрязнение</td><td style="padding:8px 0">{{ ['normal' => 'Обычное', 'heavy' => 'Сильное', 'very_heavy' => 'Очень сильное'][$order['contamination_level']] }}</td></tr>
        </table>

        <h2 style="margin:24px 0 8px;font-size:17px">Виды загрязнений</h2>
        <p style="margin:0;color:#55607a">{{ count($order['contamination_types']) ? implode(', ', $order['contamination_types']) : 'Не указаны' }}</p>

        @if(filled($order['description'] ?? null))
            <h2 style="margin:24px 0 8px;font-size:17px">Описание клиента</h2>
            <p style="margin:0;white-space:pre-line;color:#55607a">{{ $order['description'] }}</p>
        @endif

        <h2 style="margin:24px 0 8px;font-size:17px">Источник</h2>
        <p style="margin:0;color:#55607a;word-break:break-word">{{ $order['page_url'] ?? 'Не определён' }}</p>
        @if(filled($order['utm_campaign'] ?? null))
            <p style="margin:8px 0 0;color:#55607a">Кампания: {{ $order['utm_campaign'] }}</p>
        @endif
        @if(filled($order['utm_term'] ?? null))
            <p style="margin:8px 0 0;color:#55607a">Запрос: {{ $order['utm_term'] }}</p>
        @endif
        @if(filled($order['yclid'] ?? null))
            <p style="margin:8px 0 0;color:#55607a">yclid: {{ $order['yclid'] }}</p>
        @endif
    </div>
</div>
</body>
</html>

