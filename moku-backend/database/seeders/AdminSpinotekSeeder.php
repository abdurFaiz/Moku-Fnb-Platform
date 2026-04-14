<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminSpinotekSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        try {
            DB::beginTransaction();

            // create user
            $user = User::create([
                "name" => "Admin Spinotek",
                "email" => "admin@spinotek.com",
                "password" => bcrypt("admin"),
            ]);

            // assign role
            $user->assignRole(RoleEnum::ADMIN_SPINOTEK);

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }
}
