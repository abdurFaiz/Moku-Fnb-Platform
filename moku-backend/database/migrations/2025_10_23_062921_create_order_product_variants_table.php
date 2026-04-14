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
        Schema::create('order_product_variants', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('price');
            $table->foreignId('order_product_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_attribute_value_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_product_variants');
    }
};
