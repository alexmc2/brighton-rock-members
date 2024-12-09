// app/(default)/calendar/calendar-legend.tsx

'use client';

export default function CalendarLegend() {
  const categories = [
    { name: 'General Meeting', colorClass: 'bg-blue-500' },
    { name: 'Sub Meeting', colorClass: 'bg-indigo-500' },
    { name: 'Allocations', colorClass: 'bg-teal-500' },
    { name: 'Social', colorClass: 'bg-green-500' },
    { name: 'P4P Visit', colorClass: 'bg-red-500' },
    { name: 'Garden', colorClass: 'bg-purple-500' },
    { name: 'AGM', colorClass: 'bg-orange-500' },
    { name: 'EGM', colorClass: 'bg-pink-500' },
    { name: 'General Maintenance', colorClass: 'bg-yellow-500' },
    { name: 'Training', colorClass: 'bg-lime-500' },
    { name: 'Treasury', colorClass: 'bg-amber-500' },
    { name: 'Development', colorClass: 'bg-emerald-500' },
    { name: 'Miscellaneous', colorClass: 'bg-gray-500' },
  ];

  return (
    <div className="flex flex-wrap items-center p-4 border-b border-slate-200 dark:border-slate-700">
      {categories.map((category) => (
        <div key={category.name} className="flex items-center mr-4 mb-2">
          <span
            className={`w-4 h-4 rounded-full ${category.colorClass} inline-block mr-2`}
          ></span>
          <span className="text-sm text-slate-700 dark:text-slate-200">
            {category.name}
          </span>
        </div>
      ))}
    </div>
  );
}
