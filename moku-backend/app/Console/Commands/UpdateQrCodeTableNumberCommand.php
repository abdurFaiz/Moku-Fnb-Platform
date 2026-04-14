<?php

namespace App\Console\Commands;

use App\Models\Outlet;
use App\Models\TableNumber;
use Illuminate\Console\Command;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class UpdateQrCodeTableNumberCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update-qr-code-table-number-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tableNumbers = TableNumber::where('qr_code_path', null)->get();
        $outlet = Outlet::find($tableNumbers->first()->outlet_id);

        foreach ($tableNumbers as $tableNumber) {
            // generate qr code
            $qrCodeUrl = env('FE_APP_URL') . "/onboard?outlet=$outlet->slug&table=$tableNumber->id";
            $qrCodePath = "qrcodes/$outlet->id/$tableNumber->id.png";
            $fullQrCodePath = storage_path("app/public/$qrCodePath");

            // check if folder exists
            if (!file_exists(dirname($fullQrCodePath))) {
                mkdir(dirname($fullQrCodePath), 0755, true);
            }

            // generate qr code
            $qrCode = QrCode::format('png')->size(200)->generate($qrCodeUrl, $fullQrCodePath);
            $tableNumber->update([
                'qr_code_path' => $qrCodePath,
            ]);
        }
    }
}
