export interface FeedbackResponse {
    status: string
    message: string
    data: FeedbackData
}

export interface FeedbackData {
    feedback: Feedback
}

export interface Feedback {
    uuid: string
    user_id: number
    outlet_id: number
    is_done: 1 | 0; // 0 for not answer yet, 1 Already answered
    is_anonymous: boolean
    created_at: string
    updated_at: string
    questions: FeedbackQuestion[]
}

export interface FeedbackQuestion {
    id: number
    question: string
    category: number
    outlet_id: number
    created_at: string
    updated_at: string
    laravel_through_key: number
    options: FeedbackOption[]
}

export interface FeedbackOption {
    id: number
    option: string
    feedback_question_id: number
    outlet_id: number
    created_at: string
    updated_at: string
}
