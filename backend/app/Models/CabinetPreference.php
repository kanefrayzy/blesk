<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CabinetPreference extends Model
{
    protected $fillable = [
        'contr_id',
        'email',
        'email_notifications',
        'push_notifications',
        'last_orders_state',
        'notifications_prompt_dismissed_at',
        'last_checked_at',
    ];

    /**
     * Те же значения, что в базе по умолчанию. Без них только что созданная
     * запись отдаёт null, и кабинет присылает его обратно при сохранении.
     */
    protected $attributes = [
        'email_notifications' => false,
        'push_notifications' => false,
    ];

    /** На сколько дней «Не сейчас» прячет предложение включить уведомления. */
    public const PROMPT_PAUSE_DAYS = 30;

    public function shouldOfferNotifications(): bool
    {
        if ($this->push_notifications || $this->email_notifications) {
            return false;
        }

        return $this->notifications_prompt_dismissed_at === null
            || $this->notifications_prompt_dismissed_at->lt(now()->subDays(self::PROMPT_PAUSE_DAYS));
    }

    protected function casts(): array
    {
        return [
            'email' => 'encrypted',
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'last_orders_state' => 'array',
            'notifications_prompt_dismissed_at' => 'datetime',
            'last_checked_at' => 'datetime',
        ];
    }
}
