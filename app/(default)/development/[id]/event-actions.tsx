// app/(default)/development/[id]/event-actions.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  DevelopmentInitiativeWithDetails,
  DevelopmentStatus,
  DevelopmentPriority,
  DevelopmentCategory,
} from '@/types/development';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { createDevelopmentEvent } from '@/lib/actions/calendar';
import Tooltip from '@/components/tooltip';

interface EventActionsProps {
  initiative: DevelopmentInitiativeWithDetails;
}

export default function EventActions({ initiative }: EventActionsProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Form state for events
  const [title, setTitle] = useState(initiative.title);
  const [description, setDescription] = useState(initiative.description || '');
  const [category, setCategory] = useState<DevelopmentCategory>(
    initiative.category
  );
  const [priority, setPriority] = useState<DevelopmentPriority>(
    initiative.priority
  );
  const [status, setStatus] = useState<DevelopmentStatus>(initiative.status);
  const [eventDate, setEventDate] = useState(
    initiative.event_date
      ? new Date(initiative.event_date).toISOString().slice(0, 10)
      : ''
  );
  const [startTime, setStartTime] = useState(initiative.start_time || '');
  const [duration, setDuration] = useState(
    initiative.duration
      ? initiative.duration.split(' ')[0] === '24'
        ? '8'
        : initiative.duration.split(' ')[0]
      : ''
  );
  const [location, setLocation] = useState(initiative.location || '');
  const [openToEveryone, setOpenToEveryone] = useState(
    initiative.open_to_everyone
  );

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this event? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      // Delete associated calendar events first
      await supabase
        .from('calendar_events')
        .delete()
        .eq('reference_id', initiative.id)
        .eq('event_type', 'development_event');

      // Then delete the initiative
      const { data, error } = await supabase.rpc('delete_initiative', {
        p_initiative_id: initiative.id,
      });

      if (error) {
        throw error;
      }

      if (data === true) {
        router.push('/development');
      } else {
        throw new Error('Failed to delete initiative');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete event'
      );
      // Show error to user
      window.alert(
        'Failed to delete event: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      // Parse duration to interval
      let durationInterval: string | null = null;
      if (duration) {
        durationInterval = `${duration} hours`;
      }

      const data = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
        start_time: startTime || null,
        duration: durationInterval,
        location: location.trim() || null,
        max_participants: openToEveryone ? 12 : null,
        open_to_everyone: openToEveryone,
      };

      const { error: updateError } = await supabase
        .from('development_initiatives')
        .update(data)
        .eq('id', initiative.id);

      if (updateError) throw updateError;

      // Update calendar event if date is set
      if (eventDate) {
        await createDevelopmentEvent(
          title,
          description,
          eventDate,
          startTime,
          duration,
          user.id,
          profile.full_name,
          initiative.id
        );
      }

      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating event:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            disabled={isSubmitting || isDeleting}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </DialogTrigger>

        <DialogContent className="w-full max-w-lg bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleEdit} className="space-y-4">
            {/* Title & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="title"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Title
                </Label>
                <Input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label
                  htmlFor="category"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Category
                </Label>
                <select
                  id="category"
                  required
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as DevelopmentCategory)
                  }
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="general">General</option>
                  <option value="development_meeting">
                    Development Meeting
                  </option>
                  <option value="social">Social Event</option>
                  <option value="outreach">Outreach</option>
                  <option value="policy">Policy</option>
                  <option value="training">Training</option>
                  <option value="research">Research</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor="description"
                className="text-slate-900 dark:text-slate-300"
              >
                Description
              </Label>
              <Textarea
                id="description"
                required
                className="resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="status"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Status
                </Label>
                <select
                  id="status"
                  required
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as DevelopmentStatus)
                  }
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label
                  htmlFor="priority"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Priority
                </Label>
                <select
                  id="priority"
                  required
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as DevelopmentPriority)
                  }
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Date, Time & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="event_date"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Date
                </Label>
                <Input
                  type="date"
                  id="event_date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
              <div>
                <Label
                  htmlFor="start_time"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Start Time
                </Label>
                <Input
                  type="time"
                  id="start_time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
              <div>
                <Label
                  htmlFor="duration"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Duration
                </Label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="">Select duration</option>
                  <option value="0.5">Half an hour</option>
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="8">All day</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <Label
                htmlFor="location"
                className="text-slate-900 dark:text-slate-300"
              >
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSubmitting}
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex items-center">
              <Checkbox
                id="openToEveryone"
                label="Open to everyone"
                checked={openToEveryone}
                onChange={setOpenToEveryone}
                disabled={isSubmitting}
              />
              <Tooltip
                bg="dark"
                size="md"
                position="top"
                className="ml-2"
              >
                Check this box to invite all co-op members and create an event
                participant list
              </Tooltip>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="default">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
}
