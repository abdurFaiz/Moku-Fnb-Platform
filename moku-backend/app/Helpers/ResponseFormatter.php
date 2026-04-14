<?php

namespace App\Helpers;

/*
|--------------------------------------------------------------------------
| Response Formatter Helper
|--------------------------------------------------------------------------
|
| This helper will be used for any response we sent to clients.
|
*/

class ResponseFormatter
{
    /**
     * Return a success JSON response.
     *
     * @param  array|string  $data
     * @param  string  $message
     * @return \Illuminate\Http\JsonResponse
     */
    public static function success($data, string $message = 'Data successfully loaded')
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], 200);
    }

    /**
     * Return an error JSON response.
     *
     * @param  mixed $message
     * @param  int  $code
     * @return \Illuminate\Http\JsonResponse
     */
    public static function error($error, $message, int $code = 500)
    {
        $response = [
            'status' => 'error',
            'message' => $message,
            'error' => $error,
        ];

        if ($code == 422) {
            $response['message'] = 'The given data was invalid.';
            $response['errors'] = $message;
        }

        return response()->json($response, $code);
    }

    /**
     * Return a warning JSON response.
     *
     * @param  string  $message
     * @param  array|string  $details
     * @param  int  $code
     * @return \Illuminate\Http\JsonResponse
     */
    public static function warning(string $message, $details = [], int $code = 400)
    {
        return response()->json([
            'status' => 'warning',
            'message' => $message,
            'details' => $details
        ], $code);
    }
}
