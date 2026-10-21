<?php

namespace Tests\Unit;

use App\Support\PersonName;
use PHPUnit\Framework\TestCase;

class PersonNameTest extends TestCase
{
    public function test_name_is_taken_from_full_name(): void
    {
        $this->assertSame('Иван Сергеевич', PersonName::first('Толоконников Иван Сергеевич'));
        $this->assertSame('Анна', PersonName::first('ПЕТРОВА АННА'));
    }

    public function test_single_word_is_a_name_unless_it_looks_like_a_surname(): void
    {
        $this->assertSame('Максим', PersonName::first('Максим'));
        $this->assertNull(PersonName::first('Толоконников'));
        $this->assertNull(PersonName::first('Иванова'));
    }

    public function test_initials_are_shown_as_written(): void
    {
        $this->assertSame('В А', PersonName::first('Никитин В А'));
        $this->assertSame('И. С.', PersonName::first('Иванов И. С.'));
    }

    public function test_empty_gives_nothing(): void
    {
        $this->assertNull(PersonName::first(''));
        $this->assertNull(PersonName::first(null));
    }
}
