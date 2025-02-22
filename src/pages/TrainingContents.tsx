import React, { useState, useRef } from 'react';
import { Upload, Search, Filter, FolderPlus, FileText, Video, Package, Edit, Trash2, Eye, Play, Clock, Star } from 'lucide-react';
import { supabase } from '../services/api';

export const TrainingContents: React.FC = () => {
  const [contents, setContents] = useState([
    {
      id: 1,
      title: "Introduction to Machine Learning",
      type: "video",
      duration: "45 minutes",
      author: "Dr. Sarah Johnson",
      thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
      views: 1250,
      rating: 4.8
    },
    {
      id: 2,
      title: "Web Development Fundamentals",
      type: "pdf",
      pages: 125,
      author: "Michael Chen",
      thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613",
      downloads: 850,
      rating: 4.6
    },
    {
      id: 3,
      title: "Data Analysis with Python",
      type: "video",
      duration: "60 minutes",
      author: "Emily Rodriguez",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
      views: 980,
      rating: 4.9
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'pptx'].includes(fileExt || '')) {
      alert('Sadece PDF ve PPTX dosyaları yüklenebilir!');
      return;
    }

    try {
      setUploadProgress(0);
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('training-contents')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          }
        });

      if (error) throw error;

      // Create content record in database
      const { data: contentData, error: contentError } = await supabase
        .from('training_contents')
        .insert({
          title: file.name.replace(`.${fileExt}`, ''),
          type: fileExt,
          content_url: data.path,
          order_index: 0
        })
        .select()
        .single();

      if (contentError) throw contentError;

      setIsUploadModalOpen(false);
      setUploadProgress(0);
      // Refresh content list
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Dosya yükleme hatası!');
    }
  };

  const handleEditContent = async (content: any) => {
    setSelectedContent(content);
    setIsEditModalOpen(true);
  };

  const handleSaveContent = async (updatedContent: any) => {
    try {
      const { error } = await supabase
        .from('training_contents')
        .update(updatedContent)
        .eq('id', selectedContent.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      setSelectedContent(null);
      // Refresh content list
    } catch (error) {
      console.error('Error updating content:', error);
      alert('İçerik güncelleme hatası!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Eğitim İçerikleri</h1>
          <p className="mt-1 text-sm text-gray-500">Tüm eğitim materyallerinizi buradan yönetin</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-150 flex items-center"
        >
          <Upload className="h-5 w-5 mr-2" />
          İçerik Yükle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contents.map((content) => (
          <div key={content.id} className="hover-card bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-48">
              <img
                src={content.thumbnail}
                alt={content.title}
                className="w-full h-full object-cover"
              />
              {content.type === 'video' && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-80" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
                  <p className="text-sm text-gray-500">{content.author}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  content.type === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {content.type.toUpperCase()}
                </span>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  {content.type === 'video' ? (
                    <>
                      <Clock className="h-4 w-4 mr-1" />
                      {content.duration}
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-1" />
                      {content.pages} sayfa
                    </>
                  )}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  {content.rating}
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {content.type === 'video' ? `${content.views} görüntülenme` : `${content.downloads} indirme`}
                </span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-500">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-500">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İçerik Yükle</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.pptx"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Dosya Seç
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  veya sürükleyip bırakın
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, PPTX (max. 100MB)
                </p>
              </div>

              {uploadProgress > 0 && (
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold inline-block text-blue-600">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedContent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">İçerik Düzenle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Başlık</label>
                <input
                  type="text"
                  value={selectedContent.title}
                  onChange={(e) => setSelectedContent({
                    ...selectedContent,
                    title: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                <textarea
                  value={selectedContent.description || ''}
                  onChange={(e) => setSelectedContent({
                    ...selectedContent,
                    description: e.target.value
                  })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Etiketler</label>
                <input
                  type="text"
                  value={selectedContent.tags || ''}
                  onChange={(e) => setSelectedContent({
                    ...selectedContent,
                    tags: e.target.value
                  })}
                  placeholder="Virgülle ayırarak etiket ekleyin"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <select
                  value={selectedContent.category || ''}
                  onChange={(e) => setSelectedContent({
                    ...selectedContent,
                    category: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Kategori Seçin</option>
                  <option value="programming">Programlama</option>
                  <option value="design">Tasarım</option>
                  <option value="business">İş Yönetimi</option>
                  <option value="marketing">Pazarlama</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                İptal
              </button>
              <button
                onClick={() => handleSaveContent(selectedContent)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}