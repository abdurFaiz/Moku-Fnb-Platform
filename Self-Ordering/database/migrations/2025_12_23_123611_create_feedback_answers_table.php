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
        Schema::create('feedback_answers', function (Blueprint $table) {
            $table->id();
            $table->text('comment')->nullable();
            $table->foreignId('feedback_question_id')->nullable()->constrained('feedback_questions')->cascadeOnDelete();
            $table->foreignId('feedback_option_question_id')->nullable()->constrained('feedback_option_questions')->cascadeOnDelete();
            $table->foreignId('feedback_id')->nullable()->constrained('feedback')->cascadeOnDelete();
            $table->nullableMorphs('answerable');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('outlet_id')->nullable()->constrained('outlets')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback_answers');
    }
};
