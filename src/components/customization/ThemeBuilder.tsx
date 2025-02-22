import React, { useState, useEffect } from 'react';
import { ThemeService } from '../../services/api/ThemeService';
import { Save, Undo, EyeOff, Eye, Code } from 'lucide-react';

interface ThemeSection {
  id: string;
  title: string;
  properties: ThemeProperty[];
}

interface ThemeProperty {
  id: string;
  label: string;
  type: 'color' | 'select' | 'text' | 'number';
  options?: { label: string; value: string }[];
  value: string;
  path: string[];
}

export function ThemeBuilder() {
  const [sections, setSections] = useState<ThemeSection[]>([
    {
      id: 'colors',
      title: 'Renkler',
      properties: [
        {
          id: 'primary',
          label: 'Ana Renk',
          type: 'color',
          value: '#3B82F6',
          path: ['colors', 'primary']
        },
        {
          id: 'secondary',
          label: 'İkincil Renk',
          type: 'color',
          value: '#10B981',
          path: ['colors', 'secondary']
        }
      ]
    },
    {
      id: 'typography',
      title: 'Tipografi',
      properties: [
        {
          id: 'fontFamily',
          label: 'Yazı Tipi',
          type: 'select',
          options: [
            { label: 'Inter', value: 'Inter' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Open Sans', value: 'Open Sans' }
          ],
          value: 'Inter',
          path: ['typography', 'fontFamily']
        }
      ]
    }
  ]);

  const [previewMode, setPreviewMode] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const themeService = new ThemeService();

  const handlePropertyChange = (sectionId: string, propertyId: string, value: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        properties: section.properties.map(prop => {
          if (prop.id !== propertyId) return prop;
          return { ...prop, value };
        })
      };
    }));
  };

  const handleSave = async () => {
    try {
      const themeData = sections.reduce((acc, section) => {
        section.properties.forEach(prop => {
          let current = acc;
          for (let i = 0; i < prop.path.length - 1; i++) {
            if (!current[prop.path[i]]) current[prop.path[i]] = {};
            current = current[prop.path[i]];
          }
          current[prop.path[prop.path.length - 1]] = prop.value;
        });
        return acc;
      }, {} as Record<string, any>);

      await themeService.updateTheme('default', themeData);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Tema Özelleştirme</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            >
              {previewMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setShowCode(!showCode)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            >
              <Code className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Properties Panel */}
          <div className="space-y-8">
            {sections.map(section => (
              <div key={section.id} className="space-y-4">
                <h3 className="text-lg font-medium">{section.title}</h3>
                <div className="space-y-4">
                  {section.properties.map(prop => (
                    <div key={prop.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {prop.label}
                      </label>
                      {prop.type === 'color' ? (
                        <input
                          type="color"
                          value={prop.value}
                          onChange={(e) => handlePropertyChange(section.id, prop.id, e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      ) : prop.type === 'select' ? (
                        <select
                          value={prop.value}
                          onChange={(e) => handlePropertyChange(section.id, prop.id, e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          {prop.options?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={prop.type}
                          value={prop.value}
                          onChange={(e) => handlePropertyChange(section.id, prop.id, e.target.value)}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Preview Panel */}
          {previewMode && (
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Önizleme</h3>
              {/* Add preview components here */}
            </div>
          )}

          {/* Code Panel */}
          {showCode && (
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">CSS Kodu</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(sections, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => {/* Reset to defaults */}}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md flex items-center"
          >
            <Undo className="h-4 w-4 mr-2" />
            Varsayılana Dön
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
  );
}