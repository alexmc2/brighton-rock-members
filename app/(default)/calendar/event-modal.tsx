// app/(default)/calendar/event-modal.tsx

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarEventWithDetails } from '@/types/calendar';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCalendarStore } from '@/lib/stores/calendar-store';

export default function EventModal() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [event, setEvent] = useState<CalendarEventWithDetails | null>(null);
  const { selectedEventId, setSelectedEventId } = useCalendarStore();
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    if (selectedEventId) {
      supabase
        .from('calendar_events')
        .select(
          `
          *,
          created_by_user:profiles!calendar_events_created_by_fkey(
            email,
            full_name
          ),
          last_modified_by_user:profiles!calendar_events_last_modified_by_fkey(
            email,
            full_name
          )
        `
        )
        .eq('id', selectedEventId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching event:', error);
          } else {
            setEvent(data);
          }
        });
    } else {
      setEvent(null);
      setIsEditing(false);
    }
  }, [selectedEventId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !event) return;

    setIsSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const startTime = new Date(
        `${formData.get('date')}T${formData.get('start_time')}:00`
      );
      const endTime = new Date(
        `${formData.get('date')}T${formData.get('end_time')}:00`
      );

      // Get the current user for last_modified_by
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('calendar_events')
        .update({
          title: formData.get('title'),
          description: formData.get('description'),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          created_by: user.id,
          last_modified_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', event.id);

      if (error) throw error;

      setIsEditing(false);
      setSelectedEventId(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !event ||
      !window.confirm('Are you sure you want to delete this event?')
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      // If this is a doodle poll event, update the poll to remove the event_id
      if (event.reference_id) {
        const { error: pollError } = await supabase
          .from('doodle_polls')
          .update({
            event_id: null,
            closed: true, // Keep it closed even if event is deleted
            updated_at: new Date().toISOString(),
          })
          .eq('id', event.reference_id);

        if (pollError) {
          console.error('Error updating poll:', pollError);
          throw pollError;
        }
      }

      // Delete the event
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      setSelectedEventId(null);
      router.refresh();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) return null;

  // Determine if the event can be edited/deleted
  const canModify = event.event_type === 'manual' || 
    ['General Meeting', 'Sub Meeting', 'Allocations', 'P4P Visit', 'Garden', 
     'AGM', 'EGM', 'General Maintenance', 'Training', 'Treasury', 'Miscellaneous'].includes(event.event_type);

  return (
    <Dialog
      open={!!selectedEventId}
      onOpenChange={(open) => !open && setSelectedEventId(null)}
    >
      <DialogContent className="w-full max-w-lg bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? 'Edit Event' : event.title}</span>
            {!isEditing && canModify && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-900 dark:text-slate-300">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={event.title}
                required
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-900 dark:text-slate-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={event.description || ''}
                className="resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date" className="text-slate-900 dark:text-slate-300">Date</Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={format(
                    new Date(event.start_time),
                    'yyyy-MM-dd'
                  )}
                  required
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>

              <div>
                <Label htmlFor="start_time" className="text-slate-900 dark:text-slate-300">Start Time</Label>
                <Input
                  type="time"
                  id="start_time"
                  name="start_time"
                  defaultValue={format(new Date(event.start_time), 'HH:mm')}
                  required
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>

              <div>
                <Label htmlFor="end_time" className="text-slate-900 dark:text-slate-300">End Time</Label>
                <Input
                  type="time"
                  id="end_time"
                  name="end_time"
                  defaultValue={format(new Date(event.end_time), 'HH:mm')}
                  required
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="default"
                className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-slate-900 dark:text-slate-300">Description</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {event.description || 'No description provided'}
              </p>
            </div>

            <div>
              <Label className="text-slate-900 dark:text-slate-300">Time</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {format(new Date(event.start_time), 'MMMM d, yyyy h:mm a')} -{' '}
                {format(new Date(event.end_time), 'h:mm a')}
              </p>
            </div>

            <div>
              <Label>Event Type</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                {event.event_type.replace('_', ' ')}
              </p>
            </div>

            {event.created_by_user && (
              <div>
                <Label>Created By</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {event.created_by_user.full_name ||
                    event.created_by_user.email}
                </p>
              </div>
            )}

            {event.last_modified_by_user && (
              <div>
                <Label>Last Modified By</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {event.last_modified_by_user.full_name ||
                    event.last_modified_by_user.email}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
