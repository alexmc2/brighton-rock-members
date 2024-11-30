// app/(default)/calendar/calendar-navigation.tsx

'use client';

import { useCalendarContext } from './calendar-context';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarNavigation() {
  const { currentMonth, setCurrentMonth, currentYear, setCurrentYear } =
    useCalendarContext();

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={goToPreviousMonth}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={goToNextMonth}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
