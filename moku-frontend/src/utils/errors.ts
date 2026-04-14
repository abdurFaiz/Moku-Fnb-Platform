export class AppError extends Error {
    code: string;
    statusCode: number;
    context?: Record<string, any>;

    constructor(
        message: string,
        code: string,
        statusCode: number = 500,
        context?: Record<string, any>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            context: this.context,
        };
    }
}

/**
 * Payment-related errors
 */
export class PaymentError extends AppError {
    constructor(
        message: string,
        code: string = 'PAYMENT_ERROR',
        context?: Record<string, any>
    ) {
        super(message, code, 400, context);
    }
}

/**
 * Outlet-related errors
 */
export class OutletError extends AppError {
    constructor(
        message: string,
        code: string = 'OUTLET_ERROR',
        context?: Record<string, any>
    ) {
        super(message, code, 404, context);
    }
}

/**
 * Order-related errors
 */
export class OrderError extends AppError {
    constructor(
        message: string,
        code: string = 'ORDER_ERROR',
        context?: Record<string, any>
    ) {
        super(message, code, 404, context);
    }
}

/**
 * Webhook-related errors
 */
export class WebhookError extends AppError {
    constructor(
        message: string,
        code: string = 'WEBHOOK_ERROR',
        context?: Record<string, any>
    ) {
        super(message, code, 502, context);
    }
}

/**
 * Type guard to check if error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
    return error instanceof AppError;
};

/**
 * Utility to extract error message from any error type
 */
export const getErrorMessage = (error: unknown): string => {
    if (isAppError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};
