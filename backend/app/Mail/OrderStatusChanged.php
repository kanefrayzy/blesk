<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $heading,
        public readonly string $note,
        /** in_work или ready — от него зависит шкала этапов в письме. */
        public readonly string $stage = 'in_work',
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->heading);
    }

    public function content(): Content
    {
        return new Content(view: 'mail.order-status', text: 'mail.order-status-text');
    }
}
