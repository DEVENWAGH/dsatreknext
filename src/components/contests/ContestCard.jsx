'use client';

import ContestCountdown from './ContestCountdown';
import { Calendar } from 'lucide-react';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';

export default function ContestCard({ contest, isReversed }) {
  const { addContestToCalendar } = useCalendarIntegration();

  const handleAddToCalendar = () => {
    addContestToCalendar({
      title: contest.title,
      description: `DSATrek ${contest.title}`,
      startDate: contest.startDate,
      endDate: new Date(contest.startDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours duration
    });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`flex justify-between items-start mb-4 ${isReversed ? 'flex-row-reverse' : ''}`}
      >
        <div className={isReversed ? 'text-right' : ''}>
          <h3 className="font-bold text-lg">{contest.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {contest.day} {contest.time} {contest.timezone}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 ${isReversed ? 'flex-row-reverse' : ''}`}
        >
          <button
            onClick={handleAddToCalendar}
            className="text-gray-500 hover:text-amber-500 transition-colors"
            title="Add to Google Calendar"
          >
            <Calendar size={18} />
          </button>
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-medium">
            Coming Soon
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className={`text-sm font-medium ${isReversed ? 'text-right' : ''}`}>
          Starts in <ContestCountdown startDate={contest.startDate} />
        </p>
      </div>
    </div>
  );
}
