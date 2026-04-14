<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerRetentionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order->load(['user', 'outlet']);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $outletName = $this->order->outlet->name;
        return new Envelope(
            subject: "Kami Merindukanmu di $outletName!",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.customer_retention',
            with: [
                'customerName' => $this->order->user->name ?? 'Pelanggan',
                'outletName' => $this->order->outlet->name,
                'outletLogo' => $this->order->outlet->logo_url,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
