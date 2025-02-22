import React, { useState } from 'react';
import { SurveyService } from '../services/api';

interface RequiredSurveyProps {
  onComplete: () => void;
}

export function RequiredSurvey({ onComplete }: RequiredSurveyProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const surveyService = new SurveyService();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await surveyService.submitResponse(process.env.ENTRY_SURVEY_ID!, responses);
      onComplete();
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-semibold mb-6">Hoş Geldiniz!</h2>
        <p className="text-gray-600 mb-8">
          Sistemi kullanmaya başlamadan önce lütfen aşağıdaki anketi doldurun.
        </p>
        
        {/* Survey form implementation */}
        
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Gönderiliyor...' : 'Anketi Tamamla'}
          </button>
        </div>
      </div>
    </div>
  );
}