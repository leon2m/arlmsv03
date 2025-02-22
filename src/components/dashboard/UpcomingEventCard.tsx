import React from 'react';
import { Calendar, Users } from 'lucide-react';

interface UpcomingEventProps {
  title: string;
  type: 'classroom' | 'exam' | 'workshop';
  date: string;
  time: string;
  participants: number;
  onJoin: () => void;
}

export function UpcomingEventCard({ title, type, date, time, participants, onJoin }: UpcomingEventProps) {
  return (
    <div className="hover-card flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          type === 'classroom' ? 'bg-blue-100 text-blue-600' :
          type === 'exam' ? 'bg-red-100 text-red-600' :
          'bg-green-100 text-green-600'
        }`}>
          <Calendar className="h-5 w-5" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(date).toLocaleDateString('tr-TR')} - {time}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="text-sm text-gray-500 mr-4">
          <Users className="h-4 w-4 inline mr-1" />
          {participants} katılımcı
        </div>
        <button
          onClick={onJoin}
          className="button-hover-effect px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
        >
          Katıl
        </button>
      </div>
    </div>
  );
}