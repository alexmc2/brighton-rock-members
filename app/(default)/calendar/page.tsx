import { Metadata } from 'next';
import { getCalendarEvents } from '@/lib/actions/calendar';
import Calendar from './calendar';
import { addMonths, subMonths } from 'date-fns';
import { CalendarProvider } from './calendar-context';

export const metadata: Metadata = {
  title: 'Calendar - Brighton Rock',
  description: 'Calendar page for Brighton Rock Co-op',
};

export const revalidate = 0;

export default async function CalendarPage() {
  // Get events for a 3-year range
  const today = new Date();
  const startDate = subMonths(today, 1); // Include previous month for edge cases
  const endDate = addMonths(today, 36); // 3 years into the future

  const events = await getCalendarEvents(startDate, endDate);

  return (
    <CalendarProvider>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-4">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold">
              Calendar
            </h1>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden min-h-[calc(100vh-12rem)]">
          <Calendar initialEvents={events} />
        </div>
      </div>
    </CalendarProvider>
  );
}
