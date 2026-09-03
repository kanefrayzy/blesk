<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderRequestReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly array $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->order['email'], $this->order['name'])],
            subject: 'Новая заявка с сайта: '.$this->order['service'],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.order-request');
    }
}
