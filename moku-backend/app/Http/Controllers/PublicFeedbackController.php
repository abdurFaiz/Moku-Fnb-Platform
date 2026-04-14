<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PublicFeedbackController extends Controller
{
    public function create(\App\Models\Order $order)
    {
        // Placeholder for public feedback form
        return "Silahkan berikan feedback untuk pesanan: " . $order->order_code;
        // In the future: return view('pages.public.feedback.create', compact('order'));
    }
}
