// app/(default)/calendar/calendar-title.tsx

'use client';

import { useCalendarContext } from './calendar-context';

export default function CalendarTitle() {
  const { currentMonth, currentYear } = useCalendarContext();
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <h2 className="text-xl font-bold">
      {`${monthNames[currentMonth]} ${currentYear}`}
    </h2>
  );
}
