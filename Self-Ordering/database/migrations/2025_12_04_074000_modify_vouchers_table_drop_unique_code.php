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
            // Drop the existing unique constraint on 'code'
            // Note: The index name is usually 'vouchers_code_unique'
            $table->dropUnique('vouchers_code_unique');

            // Add a composite unique constraint on 'outlet_id' and 'code'
            $table->unique(['outlet_id', 'code'], 'vouchers_outlet_id_code_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vouchers', function (Blueprint $table) {
            $table->dropUnique('vouchers_outlet_id_code_unique');
            $table->unique('code', 'vouchers_code_unique');
        });
    }
};
