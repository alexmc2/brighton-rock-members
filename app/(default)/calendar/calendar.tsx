// app/(default)/calendar/calendar.tsx

'use client';

import { CalendarProvider } from './calendar-context';
import CalendarTitle from './title';
import CalendarNavigation from './calendar-navigation';
import CalendarLegend from './calendar-legend';
import { useCalendarContext } from './calendar-context';
import dynamic from 'next/dynamic';
import { CalendarEventWithDetails } from '@/types/calendar';
import EventModal from './event-modal';
import NewEventModal from './new-event-modal';

const DayView = dynamic(() => import('./day-view'), { ssr: false });
const WeekView = dynamic(() => import('./week-view'), { ssr: false });
const MonthView = dynamic(() => import('./calendar-table'), { ssr: false });

interface CalendarProps {
  initialEvents: CalendarEventWithDetails[];
}

function CalendarContent() {
  const { view } = useCalendarContext();

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0">
          <CalendarTitle />
          <div className="sm:hidden">
            <NewEventModal />
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-4">
          <CalendarNavigation />
          <div className="hidden sm:block">
            <NewEventModal />
          </div>
        </div>
      </div>
      <CalendarLegend />
      <div className="flex-1">
        <div className={view === 'month' ? 'overflow-x-auto' : ''}>
          <div className={view === 'month' ? 'min-w-[800px]' : ''}>
            <div className={view !== 'month' ? 'hidden' : ''}>
              <MonthView />
            </div>
            <div className={view !== 'week' ? 'hidden' : ''}>
              <WeekView />
            </div>
            <div className={view !== 'day' ? 'hidden' : ''}>
              <DayView />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Calendar({ initialEvents }: CalendarProps) {
  return (
    <CalendarProvider initialEvents={initialEvents}>
      <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
        <CalendarContent />
      </div>
      <EventModal />
    </CalendarProvider>
  );
}
