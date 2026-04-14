<?php

use Carbon\Carbon;
use Illuminate\Support\Str;

if (!function_exists('increment')) {
    /**
     * increment
     *
     * @param  mixed $str
     * @return void
     */
    function increment($data, $loop)
    {
        return $data->firstItem() + $loop->index;
    }
}

if (!function_exists('active')) {
    /**
     * active
     *
     * @param mixed $uri
     * @param mixed $output
     * @return void
     */
    function active($uri, $output = 'active')
    {
        return request()->routeIs($uri) ? $output : '';
    }
}

if (!function_exists('maxRowParams')) {
    function maxRowParams($max = 500)
    {
        $row = request('row', 10) > $max ? $max : request('row', 10);
        return $row;
    }
}

if (! function_exists('rupiahFormat')) {
    /**
     * Format number to rupiah
     *
     * @param  int  $number
     * @return string
     */
    function rupiahFormat($number)
    {
        return 'Rp ' . number_format($number, 0, ',', '.');
    }
}
if (! function_exists('thousandSeparator')) {
    /**
     * Format number with thousand separators
     *
     * @param  int  $number
     * @return string
     */
    function thousandSeparator($number)
    {
        return number_format($number, 0, ',', '.');
    }
}

if (!function_exists('normalizePhoneNumber')) {
    /**
     * Normalize phone number to Indonesian format (62...)
     *
     * @param  string  $phone
     * @return string
     */
    function normalizePhoneNumber($phone)
    {
        // Remove all non-digit characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If starts with 0, replace with 62
        if (Str::startsWith($phone, '0')) {
            return '62' . substr($phone, 1);
        }

        // If already starts with 62, leave as is
        if (Str::startsWith($phone, '62')) {
            return $phone;
        }

        // If starts with 8 (without 0), prepend 62
        if (Str::startsWith($phone, '8')) {
            return '62' . $phone;
        }

        // Default: prepend 62
        return '62' . $phone;
    }
}

if (!function_exists('stripZeroPhoneNumber')) {
    /**
     * Strip leading zero from phone number (0812345678 -> 812345678)
     *
     * @param  string  $phone
     * @return string
     */
    function stripZeroPhoneNumber($phone)
    {
        // Remove all non-digit characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If starts with 0, remove it
        if (Str::startsWith($phone, '0')) {
            return substr($phone, 1);
        }

        // if starts with 62, remove it
        if (Str::startsWith($phone, '62')) {
            return substr($phone, 2);
        }

        return $phone;
    }
}

if (!function_exists('calculatePoints')) {
    /**
     * Calculate points from amount, 1 point per 10000
     *
     * @param  int  $amount
     * @return int
     */
    function calculatePoints($amount)
    {
        return intval($amount / 10000);
    }
}
