// app/(default)/co-op-socials/[id]/social-event-actions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  SocialEventWithDetails,
  SocialEventCategory,
  SocialEventStatus,
} from '@/types/social';
import Tooltip from '@/components/tooltip';

interface SocialEventActionsProps {
  event: SocialEventWithDetails;
}

export default function SocialEventActions({ event }: SocialEventActionsProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
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
    event.duration ? event.duration.split(' ')[0] : ''
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
      setError(null);

      // Delete associated calendar events first
      const { error: calendarError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('reference_id', event.id)
        .eq('event_type', 'social_event');

      if (calendarError) {
        throw calendarError;
      }

      // Call the stored procedure to delete the social event and related data
      const { error } = await supabase.rpc('delete_social_event', {
        p_event_id: event.id,
      });

      if (error) {
        throw error;
      }

      // If no errors, proceed to redirect
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
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      // Parse duration to interval
      const durationInterval = duration ? `${duration} hours` : null;

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
        updated_at: new Date().toISOString(),
      };

      // Update the social event
      const { error: updateError } = await supabase
        .from('social_events')
        .update(data)
        .eq('id', event.id);

      if (updateError) throw updateError;

      // Update or create calendar event
      if (eventDate) {
        // First, delete any existing calendar event
        await supabase
          .from('calendar_events')
          .delete()
          .eq('reference_id', event.id)
          .eq('event_type', 'social_event');

        // Then create new calendar event
        const calendarData = {
          title,
          description,
          start_time: new Date(`${eventDate}T${startTime || '00:00'}`),
          end_time: new Date(`${eventDate}T${startTime || '00:00'}`),
          event_type: 'social_event',
          reference_id: event.id,
          created_by: user.id,
          category: 'Co-op Social',
          subcategory: category,
          full_name: profile.full_name,
        };

        const { error: calendarError } = await supabase
          .from('calendar_events')
          .insert(calendarData);

        if (calendarError) throw calendarError;
      }

      setIsEditDialogOpen(false);
      // No need to call router.refresh() as we have real-time subscription
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
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
          disabled={isSubmitting || isDeleting}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>

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
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as SocialEventCategory)
                  }
                  disabled={isSubmitting}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-300 py-2 px-3"
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                rows={4}
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="event_date"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Date
                </Label>
                <Input
                  id="event_date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
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
                  id="start_time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Duration & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="duration"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Duration (hours)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                />
              </div>
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
            </div>

            {/* Open to Everyone */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="openToEveryone"
                label="Open to everyone"
                checked={openToEveryone}
                onChange={setOpenToEveryone}
                disabled={isSubmitting}
              />
              <Tooltip bg="dark" size="md" position="top" className="ml-2">
                Check this box to invite all co-op members and create an event
                participant list
              </Tooltip>
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
                value={status}
                onChange={(e) => setStatus(e.target.value as SocialEventStatus)}
                disabled={isSubmitting}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-300 py-2 px-3"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
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
        disabled={isSubmitting || isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
}
