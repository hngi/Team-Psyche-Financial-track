<?php

namespace App\Http\Controllers;

use App\Http\Resources\ItemResource;
use App\Item;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ItemsController extends Controller
{
    public function counts() {
        $user = auth('api')->user();
        $weekly = Item::where('user_id', $user->id)->whereBetween('created_at', [
            Carbon::now()->startOfWeek(), 
            Carbon::now()->endOfWeek()
            ])->sum('price');

        $monthly = Item::where('user_id', $user->id)->whereBetween('created_at', [
            Carbon::now()->startOfWeek(), 
            Carbon::now()->endOfWeek()
        ])->sum('price');

        $yearly = Item::where('user_id', $user->id)->where('created_at', '>=', Carbon::now()->year)->sum('price');

        return response()->json(compact('weekly', 'monthly', 'yearly'));
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // $page = $request->has('page') ? $request->query('page') : 1;
        if ($user = auth('api')->user()) {
            $items = Item::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')->paginate(10);
    
            if ($items) {
                return ItemResource::collection($items);
            } else {
                return response()->json([
                    'message' => 'Items not created',
                ], 404);
            }
        }

        return response()->json([
            'message' => 'Unauthorized',
        ], 401);
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
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function showWeeklyItems()
    {
        if ($items = Item::whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])->paginate(10)) {
            return ItemResource::collection($items);
        } else {
            return response()->json([
                'message' => 'Item not found',
            ], 404);
        }

    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function showMonthlyItems(Request $request, $month = null)
    {
        $item = null;
        if ($month) {
            $items = Item::whereMonth('created_at', '=', Carbon::parse($month)->month)->paginate(10);
        } else {
            $items = Item::where('created_at', '>=', Carbon::now()->subMonth())->paginate(10);
        }

        if ($items) {
            return ItemResource::collection($items);
        } else {
            return response()->json([
                'message' => 'Item not found',
            ], 404);
        }

    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function showYearlyItems($year = null)
    {
        $item = null;
        if ($year) {
            $items = Item::whereYear('created_at', '=', $year)->paginate(10);
        } else {
            $items = Item::where('created_at', '>=', Carbon::now()->year)->paginate(10);
        }

        if ($items) {
            return ItemResource::collection($items);
        } else {
            return response()->json([
                'message' => 'Items not found',
            ], 404);
        }

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