<?php

namespace Database\Seeders;

use App\Models\Outlet;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OutletEmailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $outlets = Outlet::all();

        foreach ($outlets as $outlet) {
            // create user
            $user = User::create([
                'name' => $outlet->name,
                'email' => $outlet->slug . '@mail.com',
                'password' => bcrypt('password'),
                'outlet_id' => $outlet->id,
            ]);

            // assign role to user
            $user->assignRole('outlet');
        }
    }
}
