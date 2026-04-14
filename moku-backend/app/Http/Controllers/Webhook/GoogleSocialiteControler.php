<?php

namespace App\Http\Controllers\Webhook;

use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CustomerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\Auth;

class GoogleSocialiteControler extends Controller
{
    public function redirect(Request $request)
    {
        // Logout user
        auth()->logout();

        // Hapus semua session outlet-nya
        $request->session()->flush();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            // Get the Google user - with custom error handling for state
            try {
                $userFromGoogle = Socialite::driver('google')->user();
            } catch (\Laravel\Socialite\Two\InvalidStateException $stateError) {
                Log::info('Google OAuth - Attempting to get user without state validation');

                $code = request('code');
                if (!$code) {
                    throw new Exception('No authorization code received from Google');
                }

                // Use Guzzle to exchange code for token manually
                $http = new \GuzzleHttp\Client();

                try {
                    // Exchange code for access token
                    $response = $http->post('https://oauth2.googleapis.com/token', [
                        'form_params' => [
                            'code' => $code,
                            'client_id' => config('services.google.client_id'),
                            'client_secret' => config('services.google.client_secret'),
                            'redirect_uri' => config('services.google.redirect'),
                            'grant_type' => 'authorization_code',
                        ],
                    ]);

                    $tokenData = json_decode($response->getBody(), true);
                    Log::info('Google OAuth - Got token data');

                    // Get user info using access token
                    $userResponse = $http->get('https://www.googleapis.com/oauth2/v2/userinfo', [
                        'headers' => [
                            'Authorization' => 'Bearer ' . $tokenData['access_token'],
                        ],
                    ]);

                    $userData = json_decode($userResponse->getBody(), true);
                    Log::info('Google OAuth - Got user data: ' . json_encode($userData));

                    // Create a simple object with user data
                    $userFromGoogle = (object) [
                        'id' => $userData['id'],
                        'email' => $userData['email'],
                        'name' => $userData['name'],
                    ];
                } catch (\Exception $apiError) {
                    throw new Exception('Failed to exchange authorization code: ' . $apiError->getMessage());
                }
            } catch (\GuzzleHttp\Exception\ClientException $guzzleError) {
                throw new Exception('Google API error: ' . $guzzleError->getMessage());
            } catch (Exception $socialiteError) {

                // If message is empty, provide a meaningful one
                $errorMessage = $socialiteError->getMessage() ?: 'Failed to retrieve user information from Google';
                throw new Exception($errorMessage);
            }

            // At this point, $userFromGoogle has the user data
            // Check if it's a Socialite user object or our custom object
            if (is_object($userFromGoogle)) {
                $googleId = is_callable([$userFromGoogle, 'getId']) ? $userFromGoogle->getId() : $userFromGoogle->id;
                $googleEmail = is_callable([$userFromGoogle, 'getEmail']) ? $userFromGoogle->getEmail() : $userFromGoogle->email;
                $googleName = is_callable([$userFromGoogle, 'getName']) ? $userFromGoogle->getName() : $userFromGoogle->name;
            } else {
                throw new Exception('Invalid user data received from Google');
            }

            // Find or create user in database
            $user = User::where('google_id', $googleId)->first();

            if (!$user) {
                // Create new user
                $user = User::create([
                    'google_id' => $googleId,
                    'name' => $googleName,
                    'email' => $googleEmail,
                    'phone' => '', // Will be collected later if needed
                    'email_verified_at' => now(),
                ]);

                // Assign role
                $user->assignRole('customer');

                // Create customer profile
                CustomerProfile::create([
                    'uuid' => Str::uuid(),
                    'user_id' => $user->id,
                    'job' => '', // Empty string instead of null
                    'date_birth' => null, // This column allows null from the migration
                ]);

                // Refresh user with relationships
                $user = $user->fresh(['customerProfile']);
            }

            // Generate tokens
            $accessToken = $user->createToken('auth-token')->plainTextToken;
            $refreshToken = $user->createToken('refresh-token', ['refresh-token'])->plainTextToken;

            // Get frontend URL from environment or use default
            // Force use configured FRONTEND_URL to avoid inconsistencies
            $frontendUrl = config('app.frontend_url') ?: env('FRONTEND_URL', 'http://localhost:5174');

            // Ensure we always use the configured frontend URL, not the request URL
            // This prevents issues with 127.0.0.1 vs localhost
            $callbackUrl = rtrim($frontendUrl, '/') . '/auth/google/callback';

            // Build query parameters for frontend
            $queryParams = http_build_query([
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_phone' => $user->phone ?? '',
                'user_email' => $user->email,
            ]);

            $finalRedirectUrl = $callbackUrl . '?' . $queryParams;

            Log::info('Google OAuth - Redirecting to frontend: ' . $finalRedirectUrl);

            // Clear any Laravel session data to prevent redirect loops
            session()->forget('url.intended');
            session()->flush();

            // REDIRECT to frontend with absolute URL and no-cache headers
            return redirect()->away($finalRedirectUrl)
                ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');
        } catch (Exception $e) {
            // Get frontend URL consistently
            $frontendUrl = config('app.frontend_url') ?: env('FRONTEND_URL', 'http://localhost:5174');
            $errorUrl = rtrim($frontendUrl, '/') . '/auth/google/callback?error=' . urlencode($e->getMessage());

            Log::error('Google OAuth Error - Redirecting to: ' . $errorUrl);

            return redirect()->away($errorUrl);
        }
    }

    // Keep the old callback method for API calls if needed
    public function callbackJson()
    {
        try {
            $userFromGoogle = Socialite::driver('google')->user();

            // get user from database based on google user id
            $userFromDatabase = User::where('google_id', $userFromGoogle->getId())->first();

            // if user not found, create new user
            if (!$userFromDatabase) {
                $user = new User([
                    'google_id' => $userFromGoogle->getId(),
                    'name' => $userFromGoogle->getName(),
                    'email' => $userFromGoogle->getEmail(),
                ]);

                $user->save();

                // assign role
                $user->assignRole('customer');
            } else {
                $user = $userFromDatabase;
            }

            //  create new token
            $token = $user->createToken('auth-token');
            $refreshToken = $user->createToken('refresh-token', ['refresh-token'])->plainTextToken;

            return ResponseFormatter::success([
                'user' => $user,
                'token' => $token->plainTextToken,
                'refresh_token' => $refreshToken,
            ]);
        } catch (Exception $e) {
            return ResponseFormatter::error([
                'message' => 'OAuth authentication failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
