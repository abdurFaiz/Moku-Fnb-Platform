<?php

namespace Database\Seeders;

use App\Enums\FeedbackQuestionCategoryEnum;
use App\Enums\OrderStatusEnum;
use App\Models\Feedback;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackOptionQuestion;
use App\Models\FeedbackQuestion;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FeedbackSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $outlets = Outlet::all();

        $comments = [
            'Pelayanan sangat memuaskan, kopi enak!',
            'Tempatnya nyaman buat kerja, wifi kencang.',
            'Barista ramah, harga terjangkau.',
            'Sedikit berisik, tapi makanannya enak.',
            'Toilet bersih, suasana menyenangkan.',
            'Kopi susunya juara!',
            'Menunggu pesanan agak lama, tapi worth it.',
            'Tempat favorit ngerjain tugas.',
            'Musik terlalu keras di siang hari.',
            'Rasanya konsisten, selalu enak.'
        ];

        foreach ($outlets as $outlet) {
            // Get users who have completed orders at this outlet
            $userIds = Order::where('outlet_id', $outlet->id)
                ->whereIn('status', [OrderStatusEnum::COMPLETED, OrderStatusEnum::SUCCESS])
                ->inRandomOrder()
                ->limit(10) // Try to get up to 10 candidates
                ->pluck('user_id')
                ->unique(); // Ensure unique users

            // Take up to 5 users
            $users = User::whereIn('id', $userIds->take(5))->get();

            if ($users->isEmpty()) {
                $this->command->info("No relevant users found for outlet: {$outlet->name}");
                continue;
            }

            foreach ($users as $user) {
                // Check if feedback already exists for random chance to skip or verify?
                // For seeding, let's just create new ones.

                $feedback = Feedback::create([
                    'uuid' => Str::uuid(),
                    'user_id' => $user->id,
                    'outlet_id' => $outlet->id,
                    'is_done' => true,
                    'is_anonymous' => rand(0, 1),
                ]);

                // Get questions for this outlet
                $question = FeedbackQuestion::where('outlet_id', $outlet->id)->inRandomOrder()->first();

                $answerData = [
                    'feedback_question_id' => $question->id,
                    'feedback_id' => $feedback->id,
                    'user_id' => $user->id,
                    'outlet_id' => $outlet->id,
                ];

                if ($question->category === FeedbackQuestionCategoryEnum::PRODUCT) {
                    $answerData['answerable_type'] = Product::class;
                    $answerData['answerable_id'] = $question->questionable->questionable_id;
                }

                // Check if question has options
                $options = FeedbackOptionQuestion::where('feedback_question_id', $question->id)->get();

                if ($options->count() > 0) {
                    // Pick random option
                    $selectedOption = $options->random();
                    $answerData['feedback_option_question_id'] = $selectedOption->id;
                    // Sometimes options also create a comment if allowed, but usually just option_id
                    // Assuming simple answer structure where option_id is enough for multiple choice
                } else {
                    // Text answer
                    $answerData['comment'] = $comments[array_rand($comments)];
                }

                FeedbackAnswer::create($answerData);
            }
            $this->command->info("Created feedback for " . $users->count() . " users at " . $outlet->name);
        }
    }
}
