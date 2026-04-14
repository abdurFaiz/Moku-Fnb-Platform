<?php
namespace App\Services;

use App\Models\Outlet;
use Illuminate\Http\Request;

class OperationalScheduleService
{
    public function create(Outlet $outlet): void
    {
        // create operational schedule
        $schedules = [];
        for ($day = 1; $day <= 7; $day++) {
            $schedules[] = [
                'day' => $day,
                'open_time' => '08:00:00',
                'close_time' => '17:00:00',
            ];
        }
        $outlet->operationalSchedules()->createMany($schedules);
    }

    public function update(Outlet $outlet, Request $request): void
    {
        $request->validate([
            'is_open' => 'required|array',
            'is_open.*' => 'required|boolean',
            'open_time' => 'required|array',
            'open_time.*' => 'required_if:is_open.*,true|date_format:H:i',
            'close_time' => 'required|array',
            'close_time.*' => 'required_if:is_open.*,true|date_format:H:i|after:open_time.*',
        ]);

        // update operational schedule
        foreach ($request->is_open as $key => $value) {
            $outlet->operationalSchedules()->updateOrCreate(
                ['day' => $key],
                [
                    'is_open' => $value,
                    'open_time' => $value ? $request->open_time[$key] : null,
                    'close_time' => $value ? $request->close_time[$key] : null,
                ]
            );
        }
    }
}