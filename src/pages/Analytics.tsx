import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Download,
  Calendar,
  ChevronDown,
  RefreshCw,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import { supabase } from '../services/api';

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('last7Days');
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const { data: stats, error } = await supabase.rpc('get_analytics_data', {
        date_range: dateRange
      });

      if (error) throw error;
      setAnalyticsData(stats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Analitik veriler yüklenirken hata oluştu!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleExportData = async () => {
    try {
      // Implementation for data export
      const { data, error } = await supabase.rpc('export_analytics_data', {
        date_range: dateRange
      });

      if (error) throw error;

      // Convert data to CSV and download
      // Implementation depends on CSV generation library
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Veri dışa aktarma hatası!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Analitik</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Calendar className="h-5 w-5 mr-2 text-gray-400" />
              {dateRange === 'last7Days' ? 'Son 7 Gün' : 
               dateRange === 'last30Days' ? 'Son 30 Gün' : 
               'Son 12 Ay'}
              <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
            </button>
            {/* Date range dropdown */}
          </div>
          <button
            onClick={() => fetchAnalyticsData()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          <button
            onClick={handleExportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-5 w-5 mr-2 text-gray-400" />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* View Selection */}
      <div className="flex space-x-4">
        {['overview', 'detailed', 'custom'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedView === view
                ? 'bg-blue-100 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            {view === 'overview' ? 'Genel Bakış' :
             view === 'detailed' ? 'Detaylı Analiz' : 'Özel Raporlar'}
          </button>
        ))}
      </div>

      {/* Analytics Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Overview Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Genel İstatistikler</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Stat cards */}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Training Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Eğitim İlerlemesi</h3>
            {/* Implementation depends on chart library */}
          </div>

          {/* User Activity Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Kullanıcı Aktivitesi</h3>
            {/* Implementation depends on chart library */}
          </div>
        </div>

        {/* Detailed Analysis */}
        {selectedView === 'detailed' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detaylı Analiz</h2>
            {/* Detailed analysis components */}
          </div>
        )}

        {/* Custom Reports */}
        {selectedView === 'custom' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Özel Raporlar</h2>
            {/* Custom report builder */}
          </div>
        )}
      </div>
    </div>
  );
}