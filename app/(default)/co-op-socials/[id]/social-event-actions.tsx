// app/(default)/co-op-socials/[id]/social-event-actions.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  SocialEventWithDetails,
  SocialEventCategory,
  SocialEventStatus,
} from '@/types/social';
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
import { Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { createSocialEventCalendarEvent } from '@/lib/actions/calendar';
import Tooltip from '@/components/tooltip';

interface SocialEventActionsProps {
  event: SocialEventWithDetails;
}

export default function SocialEventActions({ event }: SocialEventActionsProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Form state for editing
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [category, setCategory] = useState<SocialEventCategory>(event.category);
  const [status, setStatus] = useState<SocialEventStatus>(event.status);
  const [eventDate, setEventDate] = useState(
    event.event_date
      ? new Date(event.event_date).toISOString().slice(0, 10)
      : ''
  );
  const [startTime, setStartTime] = useState(event.start_time || '');
  const [duration, setDuration] = useState(
    event.duration
      ? event.duration.split(' ')[0] === '24'
        ? '8'
        : event.duration.split(' ')[0]
      : ''
  );
  const [location, setLocation] = useState(event.location || '');
  const [openToEveryone, setOpenToEveryone] = useState(event.open_to_everyone);

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
        .eq('reference_id', event.id)
        .eq('event_type', 'social_event');

      // Then delete the event
      const { error } = await supabase
        .from('social_events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      router.push('/co-op-socials');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete event'
      );
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
        status,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
        start_time: startTime || null,
        duration: durationInterval,
        location: location.trim() || null,
        open_to_everyone: openToEveryone,
      };

      // Update the social event
      const { error: updateError } = await supabase
        .from('social_events')
        .update(data)
        .eq('id', event.id);

      if (updateError) throw updateError;

      // Update calendar event if date is set
      if (eventDate) {
        await createSocialEventCalendarEvent(
          title,
          description,
          eventDate,
          startTime,
          duration,
          user.id,
          profile.full_name,
          event.id
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
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsEditDialogOpen(true)}
        disabled={isSubmitting || isDeleting}
      >
        <Edit className="h-4 w-4 mr-1" />
        Edit
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1">
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
              <div className="col-span-1">
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
                    setCategory(e.target.value as SocialEventCategory)
                  }
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="film_night">Film Night</option>
                  <option value="album_night">Album Night</option>
                  <option value="meal">Meal</option>
                  <option value="fire">Fire</option>
                  <option value="board_games">Board Games</option>
                  <option value="tv">TV</option>
                  <option value="book_club">Book Club</option>
                  <option value="christmas_dinner">Christmas Dinner</option>
                  <option value="bike_ride">Bike Ride</option>
                  <option value="party">Party</option>
                  <option value="hang_out">Hang Out</option>
                  <option value="beach">Beach</option>
                  <option value="writing_club">Writing Club</option>
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
                  required
                  min={new Date().toISOString().split('T')[0]}
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
                  required
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
                  required
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

            {/* Location & Open to Everyone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="location"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Location
                </Label>
                <Input
                  id="location"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="openToEveryone"
                    label="Open to everyone"
                    checked={openToEveryone}
                    onChange={setOpenToEveryone}
                    disabled={isSubmitting}
                  />
                  <Tooltip bg="dark" size="md">
                    Check this box to invite all co-op members and create an
                    event participant list
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Status */}
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
                onChange={(e) => setStatus(e.target.value as SocialEventStatus)}
                disabled={isSubmitting}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
