<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FeedbackRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public $feedback;
    public $url;

    /**
     * Create a new message instance.
     */
    public function __construct($feedback)
    {
        $this->feedback = $feedback->load(['user', 'outlet']);
        // Generate frontend URL for feedback form
        $this->url = config('app.fe_app_url') . '?feedback_uuid=' . $feedback->uuid;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bagaimana Pesanan Anda di ' . $this->feedback->outlet->name . '?',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.feedback_request',
            with: [
                'customerName' => $this->feedback->user->name ?? 'Pelanggan',
                'outletName' => $this->feedback->outlet->name,
                'outletLogo' => $this->feedback->outlet->logo_url,
                'url' => $this->url,
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
