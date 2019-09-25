<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemResource;
use App\Item;
use Illuminate\Http\Request;

class ItemsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // $page = $request->has('page') ? $request->query('page') : 1;
        $items = Item::orderBy('created_at', 'desc')->paginate(10);
        if ($items) {
            return ItemResource::collection($items);
        } else {
            return response()->json([
                'message' => 'Items not created',
            ], 404);
        }

    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //Validate Request params
        $data = $request->validate([
            'name' => ['required', 'string'],
            'price' => ['required', 'regex:/^\d+(\.\d{1,2})?$/'],
            'description' => ['required', 'string'],
            'user_id' => ['required', 'integer'],
        ]);
        $item = Item::create($data);

        if ($item) {
            return new ItemResource($item);
        } else {
            return response()->json([
                'message' => 'Item not created',
            ], 404);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        if ($item = Item::whereId($id)->first()) {
            return new ItemResource($item);
        } else {
            return response()->json([
                'message' => 'Item not found',
            ], 404);
        }

    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //Validate Request params
        $data = $request->validate([
            'name' => ['required', 'string'],
            'price' => ['required', 'regex:/^\d+(\.\d{1,2})?$/'],
            'description' => ['required', 'string'],
            'user_id' => ['required', 'integer'],
        ]);

        if ($item = Item::whereId($id)->first()) {
            if ($item->update($data)) {
                return new ItemResource($item);
            }

        } else {
            return response()->json([
                'message' => 'Item not found',
            ], 404);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if (Item::whereId($id)->first()->delete()) {
            return response()->json([
                'message' => 'Item deleted successfully',
            ], 200);
        } else {
            return response()->json([
                'message' => 'Item not found',
            ], 404);
        }
    }
}