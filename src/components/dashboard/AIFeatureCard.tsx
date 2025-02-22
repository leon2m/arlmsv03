import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface AIFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
  onClick: () => void;
}

export function AIFeatureCard({ title, description, icon: Icon, action, onClick }: AIFeatureCardProps) {
  return (
    <div className="hover-card bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transition-all duration-300">
      <div className="flex items-center mb-4">
        <Icon className="h-8 w-8" />
        <h3 className="ml-3 text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-blue-100 mb-4">{description}</p>
      <button
        onClick={onClick}
        className="w-full bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200"
      >
        {action}
      </button>
    </div>
  );
}