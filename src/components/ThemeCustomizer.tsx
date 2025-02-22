import React, { useState, useEffect } from 'react';
import { ThemeService } from '../services/api/ThemeService';
import { Palette, Save, Undo } from 'lucide-react';

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<any>(null);
  const [tempSettings, setTempSettings] = useState<any>(null);
  const themeService = new ThemeService();

  useEffect(() => {
    loadActiveTheme();
  }, []);

  const loadActiveTheme = async () => {
    try {
      const theme = await themeService.getActiveTheme();
      setActiveTheme(theme);
      setTempSettings(theme.settings);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const handleSave = async () => {
    try {
      await themeService.updateTheme(activeTheme.id, tempSettings);
      setActiveTheme({ ...activeTheme, settings: tempSettings });
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const updateColor = (path: string[], value: string) => {
    setTempSettings((prev: any) => {
      const newSettings = { ...prev };
      let current = newSettings;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-200"
      >
        <Palette className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Tema Özelleştirme</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {tempSettings && (
                <div className="space-y-6">
                  {/* Color Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Renkler</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ana Renk
                        </label>
                        <input
                          type="color"
                          value={tempSettings.colors.primary[500]}
                          onChange={(e) => updateColor(['colors', 'primary', '500'], e.target.value)}
                          className="mt-1 block w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Arka Plan
                        </label>
                        <input
                          type="color"
                          value={tempSettings.colors.background}
                          onChange={(e) => updateColor(['colors', 'background'], e.target.value)}
                          className="mt-1 block w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Font Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Yazı Tipleri</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ana Yazı Tipi
                        </label>
                        <select
                          value={tempSettings.fonts.primary}
                          onChange={(e) => updateColor(['fonts', 'primary'], e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Spacing Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Boşluklar</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Küçük
                        </label>
                        <input
                          type="text"
                          value={tempSettings.spacing.small}
                          onChange={(e) => updateColor(['spacing', 'small'], e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Orta
                        </label>
                        <input
                          type="text"
                          value={tempSettings.spacing.medium}
                          onChange={(e) => updateColor(['spacing', 'medium'], e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Büyük
                        </label>
                        <input
                          type="text"
                          value={tempSettings.spacing.large}
                          onChange={(e) => updateColor(['spacing', 'large'], e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setTempSettings(activeTheme.settings)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center"
                >
                  <Undo className="h-4 w-4 mr-2" />
                  Sıfırla
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}