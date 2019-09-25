<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = ['name', 'price', 'description', 'user_id'];

    public function user()
    {
        return $this->belongsTo('App\User');
    }
}