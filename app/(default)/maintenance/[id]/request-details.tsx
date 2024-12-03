'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import {
  MaintenanceRequestWithDetails,
  MaintenancePriority,
  MaintenanceStatus,
} from '@/types/maintenance';
import VisitForm from '@/app/(default)/maintenance/[id]/visit-form';
import { Button } from '@/components/ui/button';

interface RequestDetailsProps {
  request: MaintenanceRequestWithDetails;
  houses: { id: string; name: string }[];
}

export default function RequestDetails({
  request,
  houses,
}: RequestDetailsProps) {
  const router = useRouter();
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [editingVisit, setEditingVisit] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const now = new Date();

  // Form state for editing the request
  const [title, setTitle] = useState(request.title);
  const [description, setDescription] = useState(request.description);
  const [priority, setPriority] = useState<MaintenancePriority>(
    request.priority
  );
  const [status, setStatus] = useState<MaintenanceStatus>(request.status);
  const [houseId, setHouseId] = useState(request.house_id);
  const [assignedTo, setAssignedTo] = useState<string | null>(
    request.assigned_to
  );

  // Get list of users for assignment
  const [users, setUsers] = useState<
    Array<{ id: string; email: string; full_name: string | null }>
  >([]);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name');

      if (!error && users) {
        setUsers(users);
      }
    };

    fetchUsers();
  }, [supabase]);

  // Separate visits into upcoming and past
  const upcomingVisits = request.visits
    .filter((v) => !v.completed_at && new Date(v.scheduled_date) > now)
    .sort(
      (a, b) =>
        new Date(a.scheduled_date).getTime() -
        new Date(b.scheduled_date).getTime()
    );

  const pastVisits = request.visits
    .filter((v) => v.completed_at || new Date(v.scheduled_date) <= now)
    .sort(
      (a, b) =>
        new Date(b.scheduled_date).getTime() -
        new Date(a.scheduled_date).getTime()
    );

  const handleRequestUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('maintenance_requests')
        .update({
          title,
          description,
          priority,
          status,
          house_id: houseId,
          assigned_to: assignedTo,
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      setIsEditingRequest(false);
      router.refresh();
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVisitUpdate = async (
    visitId: string,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user's profile for name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      const scheduledDate = `${formData.get('scheduled_date')}T${formData.get(
        'scheduled_time'
      )}:00`;
      const estimatedDuration = `${formData.get('estimated_duration')} hours`;
      const notes = formData.get('notes') || null;

      // Update the visit
      const { error: updateError } = await supabase
        .from('maintenance_visits')
        .update({
          scheduled_date: scheduledDate,
          estimated_duration: estimatedDuration,
          notes,
        })
        .eq('id', visitId);

      if (updateError) throw updateError;

      // Calculate end time
      const startTime = new Date(scheduledDate);
      const durationHours = parseInt(
        formData.get('estimated_duration') as string
      );
      const endTime = new Date(
        startTime.getTime() + durationHours * 60 * 60 * 1000
      );

      // First delete existing calendar event
      await supabase
        .from('calendar_events')
        .delete()
        .eq('reference_id', visitId)
        .eq('event_type', 'maintenance_visit');

      // Create new calendar event with correct metadata
      const { error: calendarError } = await supabase
        .from('calendar_events')
        .insert({
          title: `P4P Visit: ${request.title}`,
          description: `Maintenance visit for: ${title}${
            notes ? `\nNotes: ${notes}` : ''
          }`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          event_type: 'maintenance_visit',
          category: 'P4P Visit',
          created_by: user.id,
          reference_id: visitId,
          full_name: profile.full_name || profile.email,
        });

      if (calendarError) throw calendarError;

      setEditingVisit(null);
      router.refresh();
    } catch (err) {
      console.error('Error updating visit:', err);
      setError(err instanceof Error ? err.message : 'Failed to update visit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVisitDelete = async (visitId: string) => {
    if (!window.confirm('Are you sure you want to delete this visit?')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('maintenance_visits')
        .delete()
        .eq('id', visitId);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      console.error('Error deleting visit:', err);
      setError('Failed to delete visit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="px-5 py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            Request Details
          </h2>
          <Button
            onClick={() => setIsEditingRequest(!isEditingRequest)}
            size="sm"
          >
            {isEditingRequest ? 'Cancel Edit' : 'Edit Details'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 rounded">
            {error}
          </div>
        )}

        {isEditingRequest ? (
          <form onSubmit={handleRequestUpdate} className="space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              />
            </div>

            {/* House */}
            <div>
              <label
                htmlFor="house_id"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                House
              </label>
              <select
                id="house_id"
                value={houseId}
                onChange={(e) => setHouseId(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              >
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as MaintenancePriority)
                }
                required
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              >
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label
                htmlFor="assigned_to"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Assigned To
              </label>
              <select
                id="assigned_to"
                value={assignedTo || ''}
                onChange={(e) => setAssignedTo(e.target.value || null)}
                className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
              >
                <option value="">Not Assigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditingRequest(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {request.description}
              </p>
            </div>

            {/* House */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                House
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {request.house.name}
              </p>
            </div>

            {/* Priority */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Priority
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {request.priority.charAt(0).toUpperCase() +
                  request.priority.slice(1)}
              </p>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Status
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {request.status.charAt(0).toUpperCase() +
                  request.status.slice(1).replace('_', ' ')}
              </p>
            </div>

            {/* Assigned To */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Assigned To
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {request.assigned_to_user
                  ? request.assigned_to_user.full_name ||
                    request.assigned_to_user.email
                  : 'Not Assigned'}
              </p>
            </div>

            {/* Reported By */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Reported By
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {request.reported_by_user.full_name ||
                  request.reported_by_user.email}
              </p>
            </div>

            {/* Date Reported */}
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Date Reported
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        )}

        {/* Visit History */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Visit History
          </h3>
          <div className="space-y-3">
            {upcomingVisits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Upcoming Visits
                </h4>
                {upcomingVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-2"
                  >
                    {editingVisit === visit.id ? (
                      <VisitForm
                        visit={visit}
                        onSubmit={(e) => handleVisitUpdate(visit.id, e)}
                        onCancel={() => setEditingVisit(null)}
                        isSubmitting={isSubmitting}
                      />
                    ) : (
                      <>
                        <div className="grow">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                            {format(
                              new Date(visit.scheduled_date),
                              'MMM d, yyyy h:mm a'
                            )}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            Estimated Duration: {visit.estimated_duration}
                          </div>
                          {visit.notes && (
                            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                              Notes: {visit.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => setEditingVisit(visit.id)}
                            variant="default"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleVisitDelete(visit.id)}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {pastVisits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Past Visits
                </h4>
                {pastVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-2"
                  >
                    <div className="grow">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {format(
                          new Date(visit.scheduled_date),
                          'MMM d, yyyy h:mm a'
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Estimated Duration: {visit.estimated_duration}
                      </div>
                      {visit.notes && (
                        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          Notes: {visit.notes}
                        </div>
                      )}
                    </div>
                    {visit.completed_at && (
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                        Completed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {request.visits.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No visits scheduled yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
