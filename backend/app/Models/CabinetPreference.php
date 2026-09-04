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
        'last_order_signature',
    ];

    protected function casts(): array
    {
        return [
            'email' => 'encrypted',
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
        ];
    }
}
