<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Outlet;
use App\Models\FeedbackQuestion;
use App\Models\FeedbackOptionQuestion;
use App\Enums\FeedbackQuestionCategoryEnum;

class FeedbackQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $outlets = Outlet::all();

        $questions = [
            "Bagaimana kebersihan outlet kami?",
            "Apakah suhu ruangan (AC) sudah nyaman?",
            "Bagaimana kecepatan pelayanan kami?",
            "Apakah musik di ruangan terlalu keras?",
            "Seberapa ramah staff kami melayani Anda?",
        ];

        // Standard options for scale questions
        $options = [
            "Kurang",
            "Cukup",
            "Baik",
        ];

        foreach ($outlets as $outlet) {
            foreach ($questions as $qText) {
                // Create Question
                $question = FeedbackQuestion::firstOrCreate([
                    'outlet_id' => $outlet->id,
                    'question' => $qText,
                    'category' => FeedbackQuestionCategoryEnum::GENERAL,
                ]);

                // Create Options for this question
                foreach ($options as $optText) {
                    FeedbackOptionQuestion::firstOrCreate([
                        'feedback_question_id' => $question->id,
                        'outlet_id' => $outlet->id,
                        'option' => $optText,
                    ]);
                }
            }
        }
    }
}
