<?php

namespace App\Services;

class OrderChangeMessage
{
    /**
     * Состояние заказа, по которому мы замечаем изменения.
     *
     * @param  array<string, mixed>  $order  заказ в том виде, как его отдал AGBIS
     * @return array{number: string, ready: bool, ready_at: string}
     */
    public static function state(array $order): array
    {
        $status = (string) ($order['status'] ?? '');

        return [
            'number' => (string) ($order['doc_num'] ?? ''),
            // 4 и выше — исполнен, выдан, закрыт: для клиента это «готов».
            'ready' => ctype_digit($status) && (int) $status >= 4,
            'ready_at' => (string) ($order['date_out'] ?? ''),
        ];
    }

    /**
     * Что сказать клиенту, сравнив прошлое состояние заказов с нынешним.
     * Возвращает null, когда говорить не о чем.
     *
     * @param  array<string, array{number: string, ready: bool, ready_at: string}>  $before
     * @param  array<string, array{number: string, ready: bool, ready_at: string}>  $after
     * @return array{title: string, body: string}|null
     */
    public static function between(array $before, array $after): ?array
    {
        $becameReady = [];
        $accepted = [];
        $rescheduled = [];

        foreach ($after as $id => $now) {
            $was = $before[$id] ?? null;

            if ($was === null) {
                $accepted[] = $now;

                continue;
            }

            if ($now['ready'] && ! $was['ready']) {
                $becameReady[] = $now;

                continue;
            }

            if ($now['ready_at'] !== $was['ready_at'] && $now['ready_at'] !== '') {
                $rescheduled[] = $now;
            }
        }

        // Готовность — единственная новость, ради которой стоит звонить в дверь.
        if ($becameReady !== []) {
            return count($becameReady) === 1
                ? [
                    'title' => 'Заказ № '.$becameReady[0]['number'].' готов',
                    'body' => 'Вещи можно забирать.',
                ]
                : [
                    'title' => 'Готовы заказы: '.self::numbers($becameReady),
                    'body' => 'Вещи можно забирать.',
                ];
        }

        if ($rescheduled !== []) {
            return [
                'title' => 'Изменился срок по заказу № '.$rescheduled[0]['number'],
                'body' => 'Готовность: '.$rescheduled[0]['ready_at'].'.',
            ];
        }

        if ($accepted !== []) {
            return count($accepted) === 1
                ? [
                    'title' => 'Заказ № '.$accepted[0]['number'].' принят',
                    'body' => 'Вещи в работе, статус будет виден в кабинете.',
                ]
                : [
                    'title' => 'Приняты заказы: '.self::numbers($accepted),
                    'body' => 'Вещи в работе, статус будет виден в кабинете.',
                ];
        }

        // Выданные заказы уходят из списка активных. Человек в этот момент
        // стоит у стойки — уведомление ему ни к чему.
        return null;
    }

    /**
     * @param  array<int, array{number: string, ready: bool, ready_at: string}>  $orders
     */
    private static function numbers(array $orders): string
    {
        return implode(', ', array_map(fn (array $order): string => '№ '.$order['number'], $orders));
    }
}
