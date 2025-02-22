import React, { useState, useEffect } from 'react';
import { Save, Loader2, Sliders, Users, FileText, Link2, Database, Lock, Backup, Shield } from 'lucide-react';
import { supabase } from '../services/api';
import { SectionCard } from '@/components/Settings/SectionCard';

const settingsSections = [
  {
    id: 'general',
    title: 'Genel Ayarlar',
    icon: Sliders,
    adminOnly: false,
    fields: [
      { id: 'siteTitle', label: 'Site Başlığı', type: 'text' },
      { id: 'defaultLanguage', label: 'Varsayılan Dil', type: 'select', options: ['tr', 'en'] },
      { id: 'timezone', label: 'Zaman Dilimi', type: 'text' }
    ]
  },
  {
    id: 'users',
    title: 'Kullanıcı Yönetimi',
    icon: Users,
    adminOnly: true,
    fields: [
      { id: 'userRegistration', label: 'Kullanıcı Kaydı', type: 'toggle' },
      { id: 'defaultRole', label: 'Varsayılan Rol', type: 'select', options: ['user', 'admin'] }
    ]
  },
  {
    id: 'content',
    title: 'İçerik Ayarları',
    icon: FileText,
    adminOnly: true,
    fields: [
      { id: 'maxFileSize', label: 'Maksimum Dosya Boyutu (MB)', type: 'number' },
      { id: 'allowedFileTypes', label: 'İzin Verilen Dosya Türleri', type: 'text' }
    ]
  },
  {
    id: 'integrations',
    title: 'Entegrasyonlar',
    icon: Link2,
    adminOnly: true,
    fields: [
      { id: 'googleAnalyticsId', label: 'Google Analytics ID', type: 'text' },
      { id: 'ssoEnabled', label: 'SSO Aktif', type: 'toggle' }
    ]
  },
  {
    id: 'system',
    title: 'Sistem Ayarları',
    icon: Database,
    superAdminOnly: true,
    fields: [
      { id: 'backupFrequency', label: 'Yedekleme Sıklığı', type: 'select', options: ['daily', 'weekly', 'monthly'] },
      { id: 'maintenanceMode', label: 'Bakım Modu', type: 'toggle' }
    ]
  }
];

export const Settings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin' | 'superadmin'>('user');
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    checkUserRole();
    fetchSettings();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || 'user');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Ayarlar yüklenirken hata oluştu!');
    }
  };

  const handleSave = async (sectionId: string, updatedSettings: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update(updatedSettings)
        .eq('section', sectionId);
      if (error) throw error;
      alert('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ayarlar kaydedilirken hata oluştu!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">LMS Ayarları</h1>
        <button
          onClick={() => handleSave('all', settings)}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          Değişiklikleri Kaydet
        </button>
      </div>

      <div className="space-y-8">
        {settingsSections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            settings={settings}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}