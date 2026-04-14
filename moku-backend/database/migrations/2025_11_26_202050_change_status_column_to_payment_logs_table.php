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
        Schema::table('payment_logs', function (Blueprint $table) {
            $table->dropColumn(['status_code', 'payment_channel']);
            $table->string('status')->after('id')->nullable();
            $table->string('payment_type')->after('status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_logs', function (Blueprint $table) {
            $table->string('status_code')->after('id')->nullable();
            $table->string('payment_channel')->after('status')->nullable();

            $table->dropColumn(['status', 'payment_type']);
        });
    }
};
