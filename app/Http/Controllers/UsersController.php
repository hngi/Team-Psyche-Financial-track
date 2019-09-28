<?php

namespace App\Http\Controllers;

use App\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UsersController extends Controller
{
    /**
     * Create user
     *
     * @param  [string] name
     * @param  [string] email
     * @param  [string] password
     * @param  [string] password_confirmation
     * @return [string] message
     */
    public function signup(Request $request)
    {
        // $token = $this->generateOTP(8);

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            // 'token' => $token,
        ]);

        if ($user) {

            // $user->notify(new UserRegister($user));
            return response()->json([
                'message' => 'Successfully created user!',
                'user' => $user,
                // 'token' => $token,
            ], 200);
        }

    }

    /**
     * Login user and create token
     *
     * @param  [string] email
     * @param  [string] password
     * @param  [boolean] remember_me
     * @return [string] access_token
     * @return [string] token_type
     * @return [string] expires_at
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember_me' => 'boolean',
        ]);
        
        $credentials = request(['email', 'password']);
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        $user = $request->user();
        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->token;
        if ($request->remember_me) {
            $token->expires_at = Carbon::now()->addWeeks(1);
        }

        $token->save();
        return response()->json([
            'user' => $user,
            'access_token' => $tokenResult->accessToken,
            'token_type' => 'Bearer',
            'expires_at' => Carbon::parse(
                $tokenResult->token->expires_at
            )->toDateTimeString(),
        ]);
    }

    /**
     * Logout user (Revoke the token)
     *
     * @return [string] message
     */
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();
        $request->user()->token()->delete();
        return response()->json([
            'message' => 'Successfully logged out',
        ]);
    }

    /**
     * Verify a user
     *
     * @return [string] message
     */
    public function verify(Request $request)
    {
        if ($user = User::where('token', $request->token)->first()) {
            $user->token = null;
            $user->status = 2;
            if ($user->save() && $user->markEmailAsVerified()) {
                return response()->json([
                    'message' => 'Successfully verified',
                ], 200);
            }
        } else {
            return response()->json([
                'message' => 'Invalid Verification Code',
            ], 200);
        }

    }

    public function all()
    {
        return User::all();
    }

    public function find(Request $request)
    {
        return User::findOrFail($request->id);
    }

    private function generateOTP(int $n)
    {
        $generator = "1234567890";
        $result = "";

        for ($i = 1; $i <= $n; $i++) {
            $result .= \substr($generator, (rand() % (strlen($generator))), 1);
        }
        return $result;
    }

    public function index()
    {
        return view('welcome');
    }

}