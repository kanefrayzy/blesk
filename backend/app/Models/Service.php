<?php

namespace App\Models;

use App\Models\Concerns\HasSortOrder;
use App\Models\Concerns\RevalidatesContent;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasSortOrder;
    use RevalidatesContent;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'risk_items' => 'array',
            'factors' => 'array',
            'steps' => 'array',
            'prices' => 'array',
        ];
    }
}
