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
        Schema::table('vouchers', function (Blueprint $table) {
            $table->unsignedSmallInteger('price_type')->default(1)->after('type');
            $table->unsignedSmallInteger('claim_type')->default(1)->after('price_type');
            $table->unsignedBigInteger('discount_fixed')->nullable()->after('discount_percent');
            $table->unsignedInteger('min_transaction')->nullable()->after('discount_fixed');
            $table->unsignedInteger('max_usage')->nullable()->after('min_transaction');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropColumn([
                'price_type',
                'claim_type',
                'discount_fixed',
                'min_transaction',
                'max_usage',
            ]);
        });
    }
};
