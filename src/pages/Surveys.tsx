import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, Plus, Users, Calendar, BarChart, Edit, Eye, MessageSquare } from 'lucide-react';
import { supabase } from '../services/api';

export const Surveys: React.FC = () => {
  const [surveys, setSurveys] = useState([
    {
      id: 1,
      title: "Eğitim Memnuniyet Anketi",
      description: "Python Programming kursu için geri bildirim anketi",
      type: "feedback",
      status: "active",
      responses: 145,
      totalQuestions: 10,
      deadline: "2024-03-25",
      course: "Python Programming Basics",
      completionRate: 78
    },
    {
      id: 2,
      title: "Öğrenci Değerlendirme Anketi",
      description: "Web Development kursu için öğrenci değerlendirmesi",
      type: "assessment",
      status: "upcoming",
      responses: 0,
      totalQuestions: 15,
      deadline: "2024-03-30",
      course: "Web Development Fundamentals",
      completionRate: 0
    },
    {
      id: 3,
      title: "Kurs İhtiyaç Analizi",
      description: "Yeni eğitim planlaması için ihtiyaç analizi",
      type: "needs",
      status: "active",
      responses: 89,
      totalQuestions: 8,
      deadline: "2024-03-20",
      course: "General",
      completionRate: 45
    }
  ]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSurveys(data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Anketler</h1>
          <p className="mt-1 text-sm text-gray-500">Geri bildirimleri yönetin ve analiz edin</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-150 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni Anket
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Anket Ara..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Tüm Türler</option>
          <option value="feedback">Geri Bildirim</option>
          <option value="assessment">Değerlendirme</option>
          <option value="needs">İhtiyaç Analizi</option>
        </select>
        <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="upcoming">Yaklaşan</option>
          <option value="completed">Tamamlanan</option>
        </select>
      </div>

      {/* Surveys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <div key={survey.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover-card">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    survey.status === 'active' ? 'bg-green-100 text-green-800' :
                    survey.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {survey.status === 'active' ? 'Aktif' :
                     survey.status === 'upcoming' ? 'Yaklaşan' :
                     'Tamamlandı'}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">{survey.title}</h3>
                  <p className="text-sm text-gray-500">{survey.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {survey.totalQuestions} soru
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  {survey.responses} yanıt
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(survey.deadline).toLocaleDateString('tr-TR')}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BarChart className="h-4 w-4 mr-2" />
                  {survey.completionRate}% tamamlanma
                </div>
              </div>

              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                    <div
                      style={{ width: `${survey.completionRate}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Eye className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <BarChart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}