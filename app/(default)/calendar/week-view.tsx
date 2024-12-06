'use client';

import { useCalendarContext } from './calendar-context';
import { format, isSameDay, addDays } from 'date-fns';
import { useCalendarStore } from '@/lib/stores/calendar-store';

export default function WeekView() {
  const { selectedDate, events } = useCalendarContext();
  const setSelectedEventId = useCalendarStore((state) => state.setSelectedEventId);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (date: Date) => {
    return events.filter((event) =>
      isSameDay(new Date(event.start_time), date)
    );
  };

  const eventColor = (category: string): string => {
    switch (category) {
      case 'General Meeting':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300';
      case 'Sub Meeting':
        return 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300';
      case 'Allocations':
        return 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300';
      case 'Social':
        return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300';
      case 'P4P Visit':
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
      case 'Garden':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300';
      case 'AGM':
        return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300';
      case 'EGM':
        return 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300';
      case 'General Maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300';
      case 'Training':
        return 'bg-lime-100 dark:bg-lime-900/50 text-lime-700 dark:text-lime-300';
      case 'Treasury Meeting':
        return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300';
      case 'Development':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
      case 'Co-op Social':
        return 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300';
      default:
        return 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] overflow-auto">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-8 divide-x divide-slate-200 dark:divide-slate-700">
              <div className="w-20" /> {/* Wider time column */}
              {days.map((date, index) => (
                <div
                  key={date.toISOString()}
                  className="px-2 py-3 text-center"
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {dayNames[index]}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {format(date, 'MMM d')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-8 divide-x divide-slate-200 dark:divide-slate-700">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {hours.map((hour) => (
                <div key={hour} className="relative min-h-[100px]">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 py-1 text-right pr-4 sticky left-0 bg-white dark:bg-slate-900">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                </div>
              ))}
            </div>

            {days.map((date) => {
              const dayEvents = getEventsForDay(date);
              return (
                <div
                  key={date.toISOString()}
                  className="divide-y divide-slate-200 dark:divide-slate-700 relative"
                >
                  {hours.map((hour) => {
                    const hourEvents = dayEvents.filter(
                      (event) => new Date(event.start_time).getHours() === hour
                    );

                    return (
                      <div key={hour} className="relative min-h-[100px] p-1">
                        {hourEvents.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => setSelectedEventId(event.id)}
                            className={`w-full text-left px-2 py-1 mb-1 rounded text-xs ${eventColor(
                              event.event_type === 'social_event' ? 'Co-op Social' : event.category
                            )}`}
                          >
                            <div className="font-medium truncate">
                              {format(new Date(event.start_time), 'HH:mm')}
                            </div>
                            <div className="truncate">
                              {event.event_type === 'social_event' && event.subcategory
                                ? `Co-op Social (${event.subcategory
                                    .split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}): ${event.title}`
                                : `${event.category}: ${event.title}`}
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 