import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
  error?: {
    status?: number;
    statusText?: string;
    message?: string;
  };
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error }) => {
  const navigate = useNavigate();

  const getErrorMessage = () => {
    if (error?.status === 404) {
      return 'Aradığınız sayfa bulunamadı.';
    }
    return error?.message || error?.statusText || 'Beklenmeyen bir hata oluştu.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
        <div className="mb-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Hata Oluştu
        </h1>
        <p className="text-gray-600 mb-8">
          {getErrorMessage()}
        </p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Sayfayı Yenile
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Home className="h-5 w-5 mr-2" />
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
};
