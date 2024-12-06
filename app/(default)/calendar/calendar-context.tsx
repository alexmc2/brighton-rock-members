// app/(default)/calendar/calendar-context.tsx

'use client';

import { createContext, useContext, useState } from 'react';
import { CalendarEventWithDetails } from '@/types/calendar';

type CalendarView = 'month' | 'week' | 'day';

interface CalendarContextProps {
  today: Date;
  currentMonth: number;
  setCurrentMonth: (currentMonth: number) => void;
  currentYear: number;
  setCurrentYear: (currentYear: number) => void;
  view: CalendarView;
  setView: (view: CalendarView) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  events: CalendarEventWithDetails[];
  setEvents: (events: CalendarEventWithDetails[]) => void;
}

const CalendarContext = createContext<CalendarContextProps | undefined>(
  undefined
);

export const CalendarProvider = ({
  children,
  initialEvents,
}: {
  children: React.ReactNode;
  initialEvents: CalendarEventWithDetails[];
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [events, setEvents] =
    useState<CalendarEventWithDetails[]>(initialEvents);

  return (
    <CalendarContext.Provider
      value={{
        today,
        currentMonth,
        setCurrentMonth,
        currentYear,
        setCurrentYear,
        view,
        setView,
        selectedDate,
        setSelectedDate,
        events,
        setEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(
      'useCalendarContext must be used within a CalendarProvider'
    );
  }
  return context;
};
