<?php

namespace App\Helpers;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

class GeneratingHelper
{
    public static function generateCode($table)
    {
        $randomNumber = mt_rand(101010111, 999999999);

        $number = $randomNumber;

        while (DB::table($table)->where('code', $number)->exists()) {
            $number = $randomNumber;
        }

        return $number;
    }

    public static function generateMixedCode($table)
    {
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $length = 9;
        $code = '';

        do {
            $code = '';
            for ($i = 0; $i < $length; $i++) {
                $code .= $characters[mt_rand(0, strlen($characters) - 1)];
            }
        } while (DB::table($table)->where('code', $code)->exists());

        return $code;
    }
}