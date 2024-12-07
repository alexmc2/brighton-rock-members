'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MaintenanceRequestWithDetails } from '@/types/maintenance';
import { createMaintenanceVisitEvent } from '@/lib/actions/calendar';
import { Button } from '@/components/ui/button';

interface VisitSchedulerProps {
  request: MaintenanceRequestWithDetails;
}

export default function VisitScheduler({ request }: VisitSchedulerProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const scheduledDate = `${formData.get('scheduled_date')}T${formData.get(
        'scheduled_time'
      )}:00`;
      const estimatedDuration = formData.get('estimated_duration') as string;
      const notes = formData.get('notes') || null;

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      // Insert the visit
      const { data: newVisit, error: insertError } = await supabase
        .from('maintenance_visits')
        .insert({
          request_id: request.id,
          scheduled_date: scheduledDate,
          estimated_duration: `${estimatedDuration} hours`,
          notes,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Only update status if it's pending
      if (request.status === 'pending') {
        const { error: updateError } = await supabase
          .from('maintenance_requests')
          .update({ status: 'scheduled' })
          .eq('id', request.id);

        if (updateError) throw updateError;
      }

      // Create calendar event
      await createMaintenanceVisitEvent(
        newVisit.id,
        request.title,
        `Maintenance visit for: ${request.title}${
          notes ? `\nNotes: ${notes}` : ''
        }`,
        scheduledDate,
        `${estimatedDuration} hours`,
        user.id,
        profile.full_name || profile.email
      );

      form.reset();
      router.refresh();
    } catch (err) {
      console.error('Error scheduling visit:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule visit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="px-5 py-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Schedule Visit
        </h2>

        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="scheduled_date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Date
            </label>
            <input
              type="date"
              id="scheduled_date"
              name="scheduled_date"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            />
          </div>

          <div>
            <label
              htmlFor="scheduled_time"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Time
            </label>
            <input
              type="time"
              id="scheduled_time"
              name="scheduled_time"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            />
          </div>

          <div>
            <label
              htmlFor="estimated_duration"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Estimated Duration (hours)
            </label>
            <input
              type="number"
              id="estimated_duration"
              name="estimated_duration"
              min="0.5"
              step="0.5"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              placeholder="Enter P4P job reference, etc."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
