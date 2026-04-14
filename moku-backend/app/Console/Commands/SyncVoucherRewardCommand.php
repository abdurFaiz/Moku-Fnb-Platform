<?php

namespace App\Console\Commands;

use App\Enums\VoucherTypeEnum;
use App\Models\Reward;
use App\Models\Voucher;
use Illuminate\Console\Command;

class SyncVoucherRewardCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-voucher-reward-command';

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
        $voucherIds = Reward::where('voucher_id', '!=', null)->get()->pluck('voucher_id');

        Voucher::whereIn('id', $voucherIds)->update([
            'type' => VoucherTypeEnum::PRIVATE,
        ]);
    }
}
