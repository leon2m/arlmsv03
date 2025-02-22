import React, { Component, ErrorInfo } from 'react';
import { AppError } from '../utils/errors';

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
    console.error('Hata yakalandı:', error);
    console.error('Hata bilgisi:', errorInfo);

    // Burada hata loglama servisi entegre edilebilir
    // this.logError(error, errorInfo);
  }

  private formatError(error: Error): AppError {
    if (error instanceof AppError) {
      return error;
    }
    return new AppError(error.message);
  }

  render() {
    if (this.state.hasError) {
      const error = this.formatError(this.state.error!);
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Uygulama Hatası
            </h2>
            <p className="text-gray-700 mb-4">
              {error.message}
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
