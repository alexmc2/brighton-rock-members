// components/visit-form.tsx

import { MaintenanceVisit } from '@/types/maintenance';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface VisitFormProps {
  visit: MaintenanceVisit;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function VisitForm({
  visit,
  onSubmit,
  onCancel,
  isSubmitting,
}: VisitFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full space-y-3">
      {/* Date and Time Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Date
          </label>
          <input
            type="date"
            name="scheduled_date"
            defaultValue={visit.scheduled_date.split('T')[0]}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Time
          </label>
          <input
            type="time"
            name="scheduled_time"
            defaultValue={format(new Date(visit.scheduled_date), 'HH:mm')}
            required
            className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Duration Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Duration
        </label>
        <select
          name="estimated_duration"
          defaultValue={visit.estimated_duration.split(' ')[0]}
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
        >
          <option value="1">1 hour</option>
          <option value="2">2 hours</option>
          <option value="3">3 hours</option>
          <option value="4">4 hours</option>
          <option value="8">Full day (8 hours)</option>
        </select>
      </div>

      {/* Notes Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes
        </label>
        <textarea
          name="notes"
          defaultValue={visit.notes || ''}
          rows={2}
          className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
