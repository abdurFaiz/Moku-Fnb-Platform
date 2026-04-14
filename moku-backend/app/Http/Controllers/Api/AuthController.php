<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Enums\RoleEnum;
use Illuminate\Http\Request;
use App\Models\CustomerProfile;
use App\Helpers\ResponseFormatter;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = validator($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::error($validator->errors(), 'Authentication Failed', 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return ResponseFormatter::error(null, 'Invalid Credentials', 401);
        }

        $token = $user->createToken('auth-token', ['*'], now()->addDays(14));
        $refreshToken = $user->createToken('refresh-token', ['refresh-token'])->plainTextToken;

        return ResponseFormatter::success([
            'access_token' => $token->plainTextToken,
            'refresh_token' => $refreshToken,
            'user' => $user->load(['customerProfile']),
        ], 'Authenticated');
    }

    public function register(Request $request)
    {
        // Normalize phone number
        $request->merge([
            'phone' => normalizePhoneNumber($request->phone),
        ]);

        $validator = validator($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255|unique:users,phone',
            'date_birth' => 'required|date',
            'job' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'phone' => $request->phone,
            ]);

            CustomerProfile::create([
                'user_id' => $user->id,
                'date_birth' => $request->date_birth,
                'job' => $request->job,
            ]);

            // Assign a role to the user
            $user->assignRole(RoleEnum::CUSTOMER);

            // Create tokens with expiration: access token 14 days
            $token = $user->createToken('auth-token', ['*'], now()->addDays(14));
            $refreshToken = $user->createToken('refresh-token', ['refresh-token'])->plainTextToken;

            DB::commit();
            return ResponseFormatter::success([
                'access_token' => $token->plainTextToken,
                'refresh_token' => $refreshToken,
                'user' => $user->load(['customerProfile']),
            ], 'User registered successfully');
        } catch (ValidationException $e) {
            DB::rollBack();
            return ResponseFormatter::error($e->errors(), 'The given data was invalid');
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error($e->getMessage(), 'Error during registration');
        }
    }

    public function refresh(Request $request)
    {
        DB::beginTransaction();
        try {
            $user = $request->user();

            // Ensure the token has refresh-token ability
            if (!$request->user()->tokenCan('refresh-token')) {
                throw ValidationException::withMessages([
                    'token' => ['Invalid refresh token.'],
                ]);
            }

            // Revoke the current refresh token
            $request->user()->currentAccessToken()->delete();

            // Create new access and refresh tokens
            $token = $user->createToken('auth-token');
            $refreshToken = $user->createToken('refresh-token', ['refresh-token'])->plainTextToken;

            return ResponseFormatter::success([
                'access_token' => $token->plainTextToken,
                'refresh_token' => $refreshToken,
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return ResponseFormatter::error($e->getMessage(), 'Error refreshing token', 401);
        }
    }

    public function logout(Request $request)
    {
        DB::beginTransaction();
        try {
            // Revoke all tokens...
            $request->user()->tokens()->delete();

            // Clear Laravel session to prevent any cached redirects
            session()->flush();
            session()->regenerate();

            DB::commit();

            return ResponseFormatter::success(null, 'Logged out successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error($e->getMessage(), 'Error during logout', 500);
        }
    }
}
