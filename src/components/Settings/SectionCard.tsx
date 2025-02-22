import React from 'react';
import { Section } from '../../types';

interface SectionCardProps {
  section: Section;
  settings: any;
  onSave: (sectionId: string, updatedSettings: any) => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({ section, settings, onSave }) => {
  const handleChange = (fieldId: string, value: any) => {
    const updatedSettings = {
      ...settings,
      [section.id]: {
        ...(settings[section.id] || {}),
        [fieldId]: value
      }
    };
    onSave(section.id, updatedSettings);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center space-x-3">
          <section.icon className="h-6 w-6 text-gray-500" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {section.title}
          </h3>
        </div>

        <div className="mt-6 space-y-6">
          {section.fields.map((field) => (
            <div key={field.id} className="flex flex-col">
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
              </label>

              {field.type === 'toggle' ? (
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    settings[section.id]?.[field.id] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  onClick={() => handleChange(field.id, !settings[section.id]?.[field.id])}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      settings[section.id]?.[field.id] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              ) : field.type === 'select' ? (
                <select
                  id={field.id}
                  value={settings[section.id]?.[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.id}
                  value={settings[section.id]?.[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
