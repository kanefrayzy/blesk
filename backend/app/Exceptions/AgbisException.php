<?php

namespace App\Exceptions;

use RuntimeException;

class AgbisException extends RuntimeException
{
    /**
     * $fromAgbis отличает отказ по существу (капча не сошлась, номер занят)
     * от обрыва связи: первый показываем клиенту как есть, второй прячем
     * за общей фразой, потому что читать её будет не программист.
     */
    public function __construct(
        string $message = 'Сервис заказов временно недоступен. Попробуйте ещё раз чуть позже.',
        public readonly bool $fromAgbis = false,
    ) {
        parent::__construct($message);
    }
}
