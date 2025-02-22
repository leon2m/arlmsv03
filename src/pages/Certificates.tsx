import React, { useState } from 'react';
import { Award, Search, Filter, Download, Plus, Calendar, User } from 'lucide-react';
import { supabase } from '../services/api';

export const Certificates: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const handleCreateCertificate = async (certificateData: any) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .insert(certificateData)
        .select()
        .single();

      if (error) throw error;
      setIsCreateModalOpen(false);
      // Refresh certificate list
    } catch (error) {
      console.error('Error creating certificate:', error);
      alert('Sertifika oluşturma hatası!');
    }
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      const { data: certificate, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('id', certificateId)
        .single();

      if (error) throw error;

      // Generate PDF certificate
      // Implementation depends on PDF generation library
      console.log('Downloading certificate:', certificate);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Sertifika indirme hatası!');
    }
  };

  const handleViewDetails = (certificate: any) => {
    setSelectedCertificate(certificate);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and search/filter components */}

      {/* Create Certificate Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Sertifika</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Eğitim</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  {/* Training options */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kullanıcı</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  {/* User options */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Geçerlilik Süresi</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="1">1 Yıl</option>
                  <option value="2">2 Yıl</option>
                  <option value="3">3 Yıl</option>
                  <option value="0">Süresiz</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                İptal
              </button>
              <button
                onClick={() => handleCreateCertificate({})}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Details Modal */}
      {isDetailModalOpen && selectedCertificate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sertifika Detayları</h3>
            <div className="space-y-4">
              {/* Certificate details */}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Kapat
              </button>
              <button
                onClick={() => handleDownloadCertificate(selectedCertificate.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                İndir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Certificate cards with functional buttons */}
      </div>
    </div>
  );
}