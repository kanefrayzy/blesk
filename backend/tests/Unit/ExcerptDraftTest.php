<?php

namespace Tests\Unit;

use App\Filament\Resources\Posts\Schemas\PostForm;
use PHPUnit\Framework\TestCase;

class ExcerptDraftTest extends TestCase
{
    public function test_it_strips_markup_and_collapses_spacing(): void
    {
        $draft = PostForm::openingOf("<p>Первый  абзац.</p>\n<p>Второй абзац.</p>");

        $this->assertSame('Первый абзац. Второй абзац.', $draft);
    }

    public function test_short_text_is_taken_whole(): void
    {
        $this->assertSame('Коротко и всё.', PostForm::openingOf('<p>Коротко и всё.</p>'));
    }

    public function test_long_text_is_cut_at_the_end_of_a_sentence(): void
    {
        $sentence = str_repeat('Мех портится не зимой, а летом в шкафу. ', 12);

        $draft = PostForm::openingOf('<p>'.$sentence.'</p>');

        $this->assertLessThanOrEqual(300, mb_strlen($draft));
        $this->assertStringEndsWith('.', $draft);
        $this->assertStringStartsWith('Мех портится', $draft);
    }

    public function test_text_without_sentence_breaks_is_cut_at_a_word(): void
    {
        $draft = PostForm::openingOf('<p>'.str_repeat('слово ', 90).'</p>');

        $this->assertLessThanOrEqual(300, mb_strlen($draft));
        $this->assertStringEndsWith('…', $draft);
        $this->assertStringNotContainsString('слов…', $draft);
    }

    public function test_empty_body_gives_an_empty_draft(): void
    {
        $this->assertSame('', PostForm::openingOf(''));
        $this->assertSame('', PostForm::openingOf('<p></p>'));
    }

    public function test_list_items_do_not_glue_together(): void
    {
        $draft = PostForm::openingOf('<ul><li>первое</li><li>второе</li></ul>');

        $this->assertSame('первое второе', $draft);
    }
}
