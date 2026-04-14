<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\FeedbackQuestionCategoryEnum;
use App\Http\Controllers\Controller;
use App\Models\FeedbackOptionQuestion;
use App\Models\FeedbackQuestion;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

use App\Models\Product;

class FeedbackQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Outlet $outlet)
    {
        $filters = [
            'search' => request()->query('search'),
            'category' => request()->query('category'),
        ];

        $row = request()->query('row', 10);

        $questions = FeedbackQuestion::filter($filters)
            ->with(['questionables.questionable', 'options', 'answers'])
            ->withCount(['options', 'answers'])
            ->where('outlet_id', $outlet->id)
            ->latest()
            ->paginate($row)
            ->withQueryString();

        $categories = FeedbackQuestionCategoryEnum::asSelectArray();

        return view('pages.outlets.feedback_questions.index', compact('outlet', 'questions', 'categories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Outlet $outlet)
    {
        $categories = FeedbackQuestionCategoryEnum::asSelectArray();
        $products = $outlet->products()->select('id', 'name')->get();

        $data = [
            'title' => 'Tambah Pertanyaan Feedback',
            'action' => route('outlets.feedback-questions.store', $outlet->slug),
            'categories' => $categories,
            'products' => $products,
        ];

        return view('pages.outlets.feedback_questions.form', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Outlet $outlet)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'category' => ['required', Rule::in(FeedbackQuestionCategoryEnum::getValues())],
            'product_ids' => [
                'nullable',
                'array',
                Rule::requiredIf($request->category == FeedbackQuestionCategoryEnum::PRODUCT),
            ],
            'product_ids.*' => 'exists:products,id',
            'options' => 'nullable|array',
            'options.*' => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $question = FeedbackQuestion::create([
                'question' => $validated['question'],
                'category' => $validated['category'],
                'outlet_id' => $outlet->id,
            ]);

            if ($validated['category'] == FeedbackQuestionCategoryEnum::PRODUCT && !empty($validated['product_ids'])) {
                foreach ($validated['product_ids'] as $productId) {
                    \App\Models\FeedbackQuestionable::create([
                        'feedback_question_id' => $question->id,
                        'questionable_type' => Product::class,
                        'questionable_id' => $productId,
                    ]);
                }
            } else {
                // For General, we might want to link to Outlet as questionable, or just rely on outlet_id.
                // The request specifically talked about Product moving to feedback_questionables.
                // For consistency, let's link Outlet too if it's GENERAL?
                // "jika kategori nya produk dipindah ke tabel feedback_questionables agar dapat berelasi dengan banyak data"
                // Implies we only care about this for Product multiplicity.
                // But previously it saved Outlet as questionable.
                // Let's add it for consistency if it was there, but the relationship on FeedbackQuestion is gone.
                // So we MUST put it in FeedbackQuestionable if we want to query by it specifically via that table.
                // However, index filter uses `questionables`.

                // Let's safe-guard and add Outlet as questionable for GENERAL/Others if not PRODUCT.
                if ($validated['category'] != FeedbackQuestionCategoryEnum::PRODUCT) {
                    \App\Models\FeedbackQuestionable::create([
                        'feedback_question_id' => $question->id,
                        'questionable_type' => Outlet::class,
                        'questionable_id' => $outlet->id,
                    ]);
                }
            }

            if ($request->has('options') && is_array($request->options)) {
                foreach ($request->options as $optionText) {
                    if (!empty($optionText)) {
                        FeedbackOptionQuestion::create([
                            'feedback_question_id' => $question->id,
                            'option' => $optionText,
                            'outlet_id' => $outlet->id,
                        ]);
                    }
                }
            }

            DB::commit();

            notyf('Pertanyaan feedback berhasil ditambahkan.');
            return redirect()->route('outlets.feedback-questions.index', $outlet->slug);
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf('Gagal menambahkan pertanyaan feedback.', 'error');
            return redirect()->back()->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Outlet $outlet, string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet, string $id)
    {
        $question = FeedbackQuestion::with(['options', 'questionables'])
            ->findOrFail($id);

        $categories = FeedbackQuestionCategoryEnum::asSelectArray();
        $products = $outlet->products()->select('id', 'name')->get();

        $data = [
            'title' => 'Edit Pertanyaan Feedback',
            'action' => route('outlets.feedback-questions.update', [$outlet->slug, $question->id]),
            'categories' => $categories,
            'products' => $products,
            'question' => $question,
        ];

        return view('pages.outlets.feedback_questions.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet, string $id)
    {
        $question = FeedbackQuestion::where('id', $id)
            ->where('outlet_id', $outlet->id)
            ->firstOrFail();

        // Check if question has answers
        if ($question->answers()->exists()) {
            notyf('Tidak dapat mengubah pertanyaan karena sudah memiliki jawaban.', 'error');
            return redirect()->back();
        }

        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'category' => ['required', Rule::in(FeedbackQuestionCategoryEnum::getValues())],
            'product_ids' => [
                'nullable',
                'array',
                Rule::requiredIf($request->category == FeedbackQuestionCategoryEnum::PRODUCT),
            ],
            'product_ids.*' => 'exists:products,id',
            'options' => 'nullable|array',
            'options.*' => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $question->update([
                'question' => $validated['question'],
                'category' => $validated['category'],
                'outlet_id' => $outlet->id,
            ]);

            // Sync questionables
            $question->questionables()->delete();

            if ($validated['category'] == FeedbackQuestionCategoryEnum::PRODUCT && !empty($validated['product_ids'])) {
                foreach ($validated['product_ids'] as $productId) {
                    \App\Models\FeedbackQuestionable::create([
                        'feedback_question_id' => $question->id,
                        'questionable_type' => Product::class,
                        'questionable_id' => $productId,
                    ]);
                }
            } else {
                if ($validated['category'] != FeedbackQuestionCategoryEnum::PRODUCT) {
                    \App\Models\FeedbackQuestionable::create([
                        'feedback_question_id' => $question->id,
                        'questionable_type' => Outlet::class,
                        'questionable_id' => $outlet->id,
                    ]);
                }
            }

            // Sync options: Delete existing and recreate (simplest approach for now)
            // Or a more complex sync if we want to preserve IDs, but recreating is fine for simple strings.
            $question->options()->delete();

            if ($request->has('options') && is_array($request->options)) {
                foreach ($request->options as $optionText) {
                    if (!empty($optionText)) {
                        FeedbackOptionQuestion::create([
                            'feedback_question_id' => $question->id,
                            'option' => $optionText,
                            'outlet_id' => $outlet->id,
                        ]);
                    }
                }
            }

            DB::commit();

            notyf('Pertanyaan feedback berhasil diupdate.');
            return redirect()->route('outlets.feedback-questions.index', $outlet->slug);
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf('Gagal mengupdate pertanyaan feedback.', 'error');
            return redirect()->back()->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Outlet $outlet, string $id)
    {
        try {
            DB::beginTransaction();

            $productIds = $outlet->products()->pluck('id');

            $question = FeedbackQuestion::where('id', $id)
                ->where('outlet_id', $outlet->id)
                ->firstOrFail();

            // Check if question has answers
            if ($question->answers()->exists()) {
                if ($request->wantsJson()) {
                    return response()->json([
                        'isConfirmed' => false,
                        'message' => 'Tidak dapat menghapus pertanyaan karena sudah memiliki jawaban.',
                    ], 400);
                }
                notyf('Tidak dapat menghapus pertanyaan karena sudah memiliki jawaban.', 'error');
                return redirect()->back();
            }

            $question->options()->delete();
            $question->delete();

            DB::commit();

            notyf('Pertanyaan feedback berhasil dihapus.');
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            // If deleted via AJAX/JSON request
            if ($request->wantsJson()) {
                return response()->json([
                    'isConfirmed' => false,
                    'message' => 'Gagal menghapus pertanyaan feedback.',
                ], 400);
            }

            notyf('Gagal menghapus pertanyaan feedback.', 'error');
            return redirect()->back();
        }
    }
    public function analysis(Outlet $outlet, string $id)
    {
        $question = FeedbackQuestion::with(['options', 'questionables'])
            ->where('outlet_id', $outlet->id)
            ->findOrFail($id);

        $answers = $question->answers()
            ->with(['user.customerProfile', 'feedback', 'feedbackOptionQuestion'])
            ->latest()
            ->get();

        // Calculate stats for options
        $optionStats = [];
        if ($question->options->count() > 0) {
            $totalAnswers = $answers->count();
            foreach ($question->options as $index => $option) {
                $count = $answers->where('feedback_option_question_id', $option->id)->count();
                $percentage = $totalAnswers > 0 ? round(($count / $totalAnswers) * 100, 1) : 0;

                $optionStats[] = [
                    'label' => $option->option,
                    'count' => $count,
                    'percentage' => $percentage,
                    'color' => $this->getColorForIndex($index),
                ];
            }
        }

        $data = [
            'title' => 'Analisa Jawaban Feedback',
            'question' => $question,
            'answers' => $answers,
            'optionStats' => collect($optionStats),
        ];

        return view('pages.outlets.feedback_questions.analysis', $data);
    }

    private function getColorForIndex($index)
    {
        $colors = [
            '#4e73df',
            '#1cc88a',
            '#36b9cc',
            '#f6c23e',
            '#e74a3b',
            '#858796',
            '#5a5c69',
            '#f8f9fc',
            '#2e59d9',
            '#17a673'
        ];
        return $colors[$index % count($colors)];
    }
}
