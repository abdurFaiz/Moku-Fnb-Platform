<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\CustomerProfile;
use App\Models\MemberOutlet;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OutletSpinotekSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        try {
            DB::beginTransaction();

            $this->outlet1();
            $this->outlet2();

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    private function outlet1()
    {
        // create outlet
        $outlet = Outlet::create([
            "name" => "Spinocafe",
            "slug" => "spinocafe",
        ]);

        // create users
        $users = [
            [
                "name" => "Dhani",
                "pin" => bcrypt(112233),
                "role" => RoleEnum::OUTLET,
            ],
            [
                "name" => "Maria",
                "pin" => bcrypt(332211),
                "role" => RoleEnum::OUTLET,
            ],
        ];

        foreach ($users as $item) {
            $user = User::create([
                "name" => $item['name'],
                "pin" => $item['pin'],
                "outlet_id" => $outlet->id
            ]);

            // assign role
            $user->assignRole($item['role']);
        }

        // operational schedule
        $this->createOperationalSchedules($outlet);

        $userMember = [
            [
                'name' => 'Dika',
                'gender' => 1,
                'job' => 'Student',
            ],
            [
                'name' => 'Nisa',
                'gender' => 2,
                'job' => 'Student',
            ],
        ];

        $this->createUserMembers($outlet, $userMember);
    }

    private function outlet2()
    {
        // create outlet
        $outlet = Outlet::create([
            "name" => "Banjar Kopi",
            "slug" => "banjarkopi",
        ]);

        // create users
        $users = [
            [
                "name" => "Hendra",
                "pin" => bcrypt(112233),
                "role" => RoleEnum::OUTLET,
            ],
            [
                "name" => "Indah",
                "pin" => bcrypt(443322),
                "role" => RoleEnum::OUTLET,
            ],
        ];

        foreach ($users as $item) {
            $user = User::create([
                "name" => $item['name'],
                "pin" => $item['pin'],
                "outlet_id" => $outlet->id
            ]);

            // assign role
            $user->assignRole($item['role']);
        }

        // operational schedule
        $this->createOperationalSchedules($outlet);

        $userMember = [
            [
                'name' => 'Rizki',
                'gender' => 1,
                'job' => 'Employee',
            ],
            [
                'name' => 'Sari',
                'gender' => 2,
                'job' => 'Teacher',
            ],
        ];

        $this->createUserMembers($outlet, $userMember);
    }

    /**
     * Create operational schedules for an outlet.
     */
    private function createOperationalSchedules(Outlet $outlet): void
    {
        $schedules = [];
        for ($day = 1; $day <= 7; $day++) {
            $schedules[] = [
                'day' => $day,
                'is_open' => $day < 7,
                'open_time' => $day < 7 ? '08:00:00' : null,
                'close_time' => $day < 7 ? '17:00:00' : null,
            ];
        }
        $outlet->operationalSchedules()->createMany($schedules);
    }

    /**
     * Create user members for an outlet.
     */
    private function createUserMembers(Outlet $outlet, array $userMembers): void
    {
        foreach ($userMembers as $item) {
            $user = User::create([
                "name" => $item['name'],                
            ]);

            // assign role
            $user->assignRole(RoleEnum::CUSTOMER);

            // create member outlet
            MemberOutlet::create([
                'user_id' => $user->id,
                'outlet_id' => $outlet->id,
            ]);

            // create customer profile
            CustomerProfile::create([
                'user_id' => $user->id,
                'gender' => $item['gender'],
                'job' => $item['job'],
            ]);
        }
    }
}
