<?php

namespace App\Models;

use App\Models\Concerns\HasSortOrder;
use App\Models\Concerns\RevalidatesContent;
use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    use HasSortOrder;
    use RevalidatesContent;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
