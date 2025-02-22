import React, { Component, ErrorInfo } from 'react';
import { logError } from '../services/LogService';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError('ErrorBoundary caught an error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bir Hata Oluştu
              </h2>
              <p className="text-gray-600 mb-6">
                Üzgünüz, bir şeyler yanlış gitti. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sayfayı Yenile
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-700 whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
