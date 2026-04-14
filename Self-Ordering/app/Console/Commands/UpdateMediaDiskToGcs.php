<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateMediaDiskToGcs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:update-disk-to-gcs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update media disk and conversions_disk from public to gcs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to update media disk configuration...');

        try {
            // Count records that will be updated
            $countDisk = DB::table('media')
                ->where('disk', 'public')
                ->count();

            $countConversionsDisk = DB::table('media')
                ->where('conversions_disk', 'public')
                ->count();

            if ($countDisk === 0 && $countConversionsDisk === 0) {
                $this->info('No records found with disk or conversions_disk set to "public".');
                return Command::SUCCESS;
            }

            $this->info("Found {$countDisk} records with disk='public'");
            $this->info("Found {$countConversionsDisk} records with conversions_disk='public'");

            if (!$this->confirm('Do you want to proceed with the update?', true)) {
                $this->warn('Update cancelled.');
                return Command::FAILURE;
            }

            // Update disk column
            $updatedDisk = DB::table('media')
                ->where('disk', 'public')
                ->update(['disk' => 'gcs']);

            // Update conversions_disk column
            $updatedConversionsDisk = DB::table('media')
                ->where('conversions_disk', 'public')
                ->update(['conversions_disk' => 'gcs']);

            $this->info("Successfully updated {$updatedDisk} records for disk column.");
            $this->info("Successfully updated {$updatedConversionsDisk} records for conversions_disk column.");
            $this->newLine();
            $this->info('✓ Media disk configuration updated successfully!');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error updating media disk configuration: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
