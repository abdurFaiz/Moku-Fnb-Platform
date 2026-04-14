<?php

namespace App\Console\Commands;

use App\Models\Outlet;
use App\Services\Merchant\IpaymuMerchantService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PopulateOutletData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'outlet:populate-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate missing data (email, phone, ipaymu merchant) for outlets.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $outlets = Outlet::whereNull('email')->orWhere('email', '')->get();

        if ($outlets->isEmpty()) {
            $this->info('No outlets found with missing emails.');
            return;
        }

        $this->info("Found {$outlets->count()} outlets with missing emails. Processing...");

        $bar = $this->output->createProgressBar($outlets->count());
        $bar->start();

        foreach ($outlets as $outlet) {
            DB::beginTransaction();

            // Generate email
            $cleanName = Str::slug($outlet->name, '');
            $email = $cleanName . '@gmail.com';

            $outlet->email = $email;
            $outlet->phone = normalizePhoneNumber($outlet->phone);
            $outlet->save();

            // save merchant ipaymu
            try {
                $merchantIpaymuService = new IpaymuMerchantService;
                $merchant = $merchantIpaymuService->registerMerchant($outlet);

                // print $merchant
                $this->info($merchant['message']);
            } catch (\Exception $e) {
                $this->error($e->getMessage());
                DB::rollBack();
            }

            DB::commit();

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Successfully populated outlet data.');
    }
}
