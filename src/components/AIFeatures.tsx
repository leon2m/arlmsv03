import React, { useState, useEffect } from 'react';
import { useAIAssistant } from '../hooks/useAIAssistant';
import { useOfflineSupport } from '../hooks/useOfflineSupport';
import { Loader2, Brain, Target, BookOpen } from 'lucide-react';

interface AIFeaturesProps {
  userId: string;
}

export function AIFeatures({ userId }: AIFeaturesProps) {
  const {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    analyzeLearning,
    generatePath
  } = useAIAssistant(userId);

  const { isOnline, lastSyncTime } = useOfflineSupport();
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Record<string, any>>({});

  useEffect(() => {
    // Kullanıcının mevcut bağlamını al
    const currentContext = {
      recentActivities: [], // Son aktiviteleri getir
      completedCourses: [], // Tamamlanan kursları getir
      skillLevels: {} // Yetenek seviyelerini getir
    };

    getSuggestions(currentContext);
  }, [userId]);

  const handleAnalysis = async () => {
    const learningData = {
      progress: [], // İlerleme verilerini getir
      assessments: [], // Değerlendirme sonuçlarını getir
      timeSpent: {} // Harcanan zamanı getir
    };

    const analysis = await analyzeLearning(learningData);
    // Analiz sonuçlarını işle
  };

  const handlePathGeneration = async () => {
    const response = await generatePath(learningGoals, preferences);
    // Öğrenme yolunu güncelle
  };

  return (
    <div className="space-y-6">
      {/* Online/Offline Durum */}
      <div className={`flex items-center justify-between p-4 rounded-lg ${
        isOnline ? 'bg-green-50' : 'bg-yellow-50'
      }`}>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${
            isOnline ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm font-medium">
            {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
          </span>
        </div>
        {!isOnline && (
          <span className="text-sm text-gray-500">
            Son senkronizasyon: {lastSyncTime?.toLocaleString()}
          </span>
        )}
      </div>

      {/* AI Önerileri */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Brain className="h-5 w-5 mr-2 text-indigo-500" />
            AI Önerileri
          </h3>
          {isLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          )}
        </div>

        {error ? (
          <div className="text-red-500 text-sm">{error.message}</div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start p-3 bg-gray-50 rounded-lg"
              >
                <BookOpen className="h-5 w-5 mr-3 text-indigo-500 mt-0.5" />
                <p className="text-sm text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Öğrenme Yolu */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Target className="h-5 w-5 mr-2 text-indigo-500" />
            Öğrenme Yolu
          </h3>
          <button
            onClick={handlePathGeneration}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors"
            disabled={isLoading || !isOnline}
          >
            Yol Oluştur
          </button>
        </div>

        <div className="space-y-4">
          {/* Hedefler */}
          <div className="space-y-2">
            {learningGoals.map((goal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{goal}</span>
                <button
                  onClick={() => {
                    setLearningGoals(goals => 
                      goals.filter((_, i) => i !== index)
                    );
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  Kaldır
                </button>
              </div>
            ))}
          </div>

          {/* Yeni Hedef Ekleme */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).goal as HTMLInputElement;
              if (input.value.trim()) {
                setLearningGoals(goals => [...goals, input.value.trim()]);
                input.value = '';
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              name="goal"
              placeholder="Yeni hedef ekle..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ekle
            </button>
          </form>
        </div>
      </div>

      {/* Offline Senkronizasyon */}
      {!isOnline && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-700">
            Çevrimdışı moddasınız. Değişiklikleriniz internet bağlantısı sağlandığında otomatik olarak senkronize edilecektir.
          </p>
        </div>
      )}
    </div>
  );
}
