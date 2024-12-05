// app/(default)/co-op-socials/new-social-event-modal.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { SocialEventCategory } from '@/types/social';
import { Checkbox } from '@/components/ui/checkbox';
import Tooltip from '@/components/tooltip';

export default function NewSocialEventModal() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SocialEventCategory>('film_night');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [openToEveryone, setOpenToEveryone] = useState(true);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('film_night');
    setEventDate('');
    setStartTime('');
    setDuration('');
    setLocation('');
    setOpenToEveryone(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        setError('User not found');
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

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        category,
        status: 'upcoming' as const,
        created_by: user.id,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
        start_time: startTime || null,
        duration: durationInterval,
        location: location.trim() || null,
        open_to_everyone: openToEveryone,
      };

      // Insert social event
      const { data: newEvent, error: insertError } = await supabase
        .from('social_events')
        .insert(eventData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Create calendar event if date is set
      if (eventDate && newEvent) {
        const calendarData = {
          title,
          description,
          start_time: new Date(`${eventDate}T${startTime}`),
          end_time: new Date(`${eventDate}T${startTime}`),
          event_type: 'social_event',
          reference_id: newEvent.id,
          created_by: user.id,
          category: category,
          full_name: profile.full_name,
        };

        const { error: calendarError } = await supabase
          .from('calendar_events')
          .insert(calendarData);

        if (calendarError) throw calendarError;
      }

      resetForm();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating social event:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create social event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Add Social Event
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-lg bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle>New Social Event</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <option value="24">All day</option>
              </select>
            </div>
          </div>

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
                <Tooltip bg="dark" size="md" position="top" className="ml-2">
                  Check this box to invite all co-op members and create an event
                  participant list
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="default">
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
