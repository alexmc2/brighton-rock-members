// app/(default)/calendar/calendar-title.tsx

'use client';

import { useCalendarContext } from './calendar-context';
import { format } from 'date-fns';

export default function CalendarTitle() {
  const { currentMonth, currentYear, view, selectedDate } =
    useCalendarContext();

  const getTitle = () => {
    switch (view) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${format(weekStart, 'MMMM d')} - ${format(
            weekEnd,
            'd, yyyy'
          )}`;
        } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
          return `${format(weekStart, 'MMMM d')} - ${format(
            weekEnd,
            'MMMM d, yyyy'
          )}`;
        } else {
          return `${format(weekStart, 'MMMM d, yyyy')} - ${format(
            weekEnd,
            'MMMM d, yyyy'
          )}`;
        }
      case 'month':
        return format(new Date(currentYear, currentMonth), 'MMMM yyyy');
      default:
        return '';
    }
  };

  return (
    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
      {getTitle()}
    </h2>
  );
}
