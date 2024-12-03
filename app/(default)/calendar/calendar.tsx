// app/(default)/calendar/calendar.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { useCalendarContext } from './calendar-context';
import CalendarNavigation from './calendar-navigation';
import CalendarTitle from './title';
import { CalendarEventWithDetails } from '@/types/calendar';
import NewEventModal from './new-event-modal';
import EventModal from './event-modal';
import { useCalendarStore } from '@/lib/stores/calendar-store';
import CalendarLegend from './calendar-legend';

interface CalendarProps {
  initialEvents: CalendarEventWithDetails[];
}

export default function Calendar({ initialEvents }: CalendarProps) {
  const { currentMonth, currentYear } = useCalendarContext();
  const setSelectedEventId = useCalendarStore(
    (state) => state.setSelectedEventId
  );

  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    // Generate all days for the current month, including leading and trailing days to fill the weeks
    const firstDayOfMonth = startOfMonth(new Date(currentYear, currentMonth));
    const lastDayOfMonth = endOfMonth(new Date(currentYear, currentMonth));
    const firstDayOfCalendar = startOfWeek(firstDayOfMonth);
    const lastDayOfCalendar = endOfWeek(lastDayOfMonth);
    const daysInterval = eachDayOfInterval({
      start: firstDayOfCalendar,
      end: lastDayOfCalendar,
    });
    setDays(daysInterval);
  }, [currentMonth, currentYear]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (date: Date) => {
    return initialEvents.filter((event) =>
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
      case 'Development Event':
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
      case 'Miscellaneous':
        return 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Calendar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <CalendarTitle />
          <div className="flex items-center space-x-4">
            <CalendarNavigation />
            <NewEventModal />
          </div>
        </div>

        {/* Calendar Legend */}
        <CalendarLegend />

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7">
          {/* Day names */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(
              day,
              new Date(currentYear, currentMonth)
            );
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[120px] p-2 border border-slate-200 dark:border-slate-700
                  ${
                    !isCurrentMonth
                      ? 'bg-slate-100 dark:bg-slate-900/50 text-slate-400'
                      : 'bg-white dark:bg-slate-800'
                  }
                  ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
              >
                <div className="text-sm font-medium">{format(day, 'd')}</div>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${eventColor(
                        event.category
                      )}`}
                    >
                      {format(new Date(event.start_time), 'HH:mm')} -{' '}
                      {`${
                        event.category === 'Development Event'
                          ? 'Development'
                          : event.category
                      }: ${event.title}`}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EventModal />
    </>
  );
}
