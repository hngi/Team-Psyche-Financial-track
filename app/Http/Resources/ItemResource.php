<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => (int) $this->id,
            'name' => (string) $this->name,
            'price' => (string) $this->price,
            'description' => (string) $this->description,
            'created_by' => new UserResource($this->user),
            'created_at' => $this->created_at,
        ];
    }
}