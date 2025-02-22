import React, { useEffect, useState } from 'react';
import { predictionService } from '../services/supabase';
import { Book, Star, Clock, TrendingUp, Zap } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  rating: number;
  difficulty: string;
  thumbnail: string;
}

export function PredictiveRecommendations({ userId }: { userId: string }) {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      const courses = await predictionService.getPredictedCourses(userId);
      setRecommendations(courses || []);
    } catch (error) {
      console.error('Öneriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Sizin İçin Önerilen Eğitimler
        </h2>
        <TrendingUp className="w-5 h-5 text-blue-500" />
      </div>

      <div className="space-y-4">
        {recommendations.map((course) => (
          <div
            key={course.id}
            className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-24 h-24 object-cover rounded-md"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                <Book className="w-8 h-8 text-gray-400" />
              </div>
            )}

            <div className="ml-4 flex-1">
              <h3 className="font-medium text-gray-900">{course.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{course.description}</p>
              
              <div className="flex items-center mt-2 space-x-4">
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 mr-1 text-yellow-400" />
                  {course.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 px-2 py-1 bg-gray-200 rounded">
                  {course.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
