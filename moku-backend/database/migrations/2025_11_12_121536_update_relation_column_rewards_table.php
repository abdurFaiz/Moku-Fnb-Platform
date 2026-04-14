<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rewards', function (Blueprint $table) {
            $table->dropMorphs('rewardable');

            $table->foreignId('voucher_id')->after('point')->constrained();
            $table->foreignId('product_id')->after('voucher_id')->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rewards', function (Blueprint $table) {
            $table->morphs('rewardable');
            
            $table->dropForeign(['voucher_id']);
            $table->dropColumn('voucher_id');
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
        });
    }
};
