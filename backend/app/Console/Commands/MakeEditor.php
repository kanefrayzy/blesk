<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

use function Laravel\Prompts\password as askPassword;
use function Laravel\Prompts\text;

/**
 * Заводит редактора панели или выдаёт права уже существующему пользователю.
 * Отдельная команда вместо make:filament-user — та не знает про is_editor.
 */
class MakeEditor extends Command
{
    protected $signature = 'blesk:editor
                            {--name= : Имя редактора}
                            {--email= : Почта для входа}
                            {--password= : Пароль}';

    protected $description = 'Создать редактора панели или выдать права существующему пользователю';

    public function handle(): int
    {
        $email = $this->option('email') ?: text('Почта', required: true);
        $existing = User::query()->where('email', $email)->first();

        if ($existing) {
            $existing->update(['is_editor' => true]);
            $this->info("Пользователь {$email} теперь редактор.");

            return self::SUCCESS;
        }

        $name = $this->option('name') ?: text('Имя', required: true);
        $password = $this->option('password') ?: askPassword('Пароль', required: true);

        $validator = Validator::make(
            ['name' => $name, 'email' => $email, 'password' => $password],
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:12'],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'is_editor' => true,
        ]);

        $this->info("Редактор {$email} создан.");

        return self::SUCCESS;
    }
}
