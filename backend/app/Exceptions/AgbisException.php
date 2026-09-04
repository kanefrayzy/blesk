<?php

namespace App\Exceptions;

use RuntimeException;

class AgbisException extends RuntimeException
{
    public function __construct(string $message = 'Сервис заказов временно недоступен. Попробуйте ещё раз чуть позже.')
    {
        parent::__construct($message);
    }
}
