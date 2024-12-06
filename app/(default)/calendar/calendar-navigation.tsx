// app/(default)/calendar/calendar-navigation.tsx

'use client';

import { useCalendarContext } from './calendar-context';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

export default function CalendarNavigation() {
  const {
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    view,
    setView,
    selectedDate,
    setSelectedDate,
  } = useCalendarContext();

  const handlePrevious = () => {
    switch (view) {
      case 'day':
        setSelectedDate(subDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(subWeeks(selectedDate, 1));
        break;
      case 'month':
        const prevMonth = subMonths(new Date(currentYear, currentMonth), 1);
        setCurrentMonth(prevMonth.getMonth());
        setCurrentYear(prevMonth.getFullYear());
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'day':
        setSelectedDate(addDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(addWeeks(selectedDate, 1));
        break;
      case 'month':
        const nextMonth = addMonths(new Date(currentYear, currentMonth), 1);
        setCurrentMonth(nextMonth.getMonth());
        setCurrentYear(nextMonth.getFullYear());
        break;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <Button
          variant={view === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('day')}
          className="px-2 sm:px-3"
        >
          Day
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('week')}
          className="px-2 sm:px-3"
        >
          Week
        </Button>
        <Button
          variant={view === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('month')}
          className="px-2 sm:px-3"
        >
          Month
        </Button>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={handlePrevious}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
