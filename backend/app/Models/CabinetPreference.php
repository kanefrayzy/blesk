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
        'last_checked_at',
    ];

    protected function casts(): array
    {
        return [
            'email' => 'encrypted',
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'last_orders_state' => 'array',
            'last_checked_at' => 'datetime',
        ];
    }
}
