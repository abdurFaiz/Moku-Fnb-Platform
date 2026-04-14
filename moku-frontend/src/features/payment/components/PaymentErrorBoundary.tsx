import React from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentErrorBoundaryProps {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class PaymentErrorBoundary extends React.Component<PaymentErrorBoundaryProps, State> {
    constructor(props: PaymentErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Payment Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <PaymentErrorFallback error={this.state.error} />;
        }

        return this.props.children;
    }
}

function PaymentErrorFallback({ error }: { error: Error | null }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 rounded-full p-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                {/* Error Title */}
                <h1 className="text-2xl font-rubik font-bold text-title-black mb-2">
                    Oops! Something went wrong
                </h1>

                {/* Error Message */}
                <p className="text-gray-600 text-sm mb-4">
                    We encountered an unexpected error while processing your payment. Please try again or contact support.
                </p>

                {/* Technical Details (for debugging) */}
                {error && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-6 text-left">
                        <p className="text-xs font-mono text-gray-700 wrap-break-word">
                            <span className="font-bold">Error:</span> {error.message}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-3 bg-primary-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/home')}
                        className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>

                {/* Support Message */}
                <p className="text-xs text-gray-500 mt-6">
                    If the problem persists, please contact our support team.
                </p>
            </div>
        </div>
    );
}
