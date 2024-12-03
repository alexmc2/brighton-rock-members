// app/(default)/co-op-socials/new-social-event-modal.tsx

'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { SocialEventCategory, SocialEvent } from '@/types/social';
import { Checkbox } from '@/components/ui/checkbox';
import { createSocialEventCalendarEvent } from '@/lib/actions/calendar';
import { createSocialEvent } from '@/lib/actions/social-events';
import Tooltip from '@/components/tooltip';

export default function NewSocialEventModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

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
        if (duration === '24') {
          durationInterval = '24 hours';
        } else {
          durationInterval = `${duration} hours`;
        }
      }

      const data = {
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

      // Insert the social event
      const newEvent = await createSocialEvent(data);

      if (!newEvent) throw new Error('Failed to create social event');

      // Create calendar event if date is set
      if (eventDate && newEvent) {
        await createSocialEventCalendarEvent(
          title,
          description,
          eventDate,
          startTime,
          duration,
          user.id,
          profile.full_name,
          newEvent.id
        );
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
    <>
      <Button onClick={() => setIsOpen(true)} variant="default">
        <Plus className="h-4 w-4 mr-2" />
        Add Social Event
      </Button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          {/* Background overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          {/* Dialog content */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white dark:bg-slate-800 p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    New Social Event
                  </Dialog.Title>

                  {error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 mb-4">
                      <p className="text-sm text-red-700 dark:text-red-200">
                        {error}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title & Category */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          required
                          value={category}
                          onChange={(e) =>
                            setCategory(e.target.value as SocialEventCategory)
                          }
                          disabled={isSubmitting}
                          className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                        >
                          <option value="">Select category</option>
                          <option value="film_night">Film Night</option>
                          <option value="album_night">Album Night</option>
                          <option value="meal">Meal</option>
                          <option value="fire">Fire</option>
                          <option value="board_games">Board Games</option>
                          <option value="tv">TV</option>
                          <option value="book_club">Book Club</option>
                          <option value="christmas_dinner">
                            Christmas Dinner
                          </option>
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
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        required
                        className="resize-none"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Date, Time & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="event_date">Date</Label>
                        <Input
                          type="date"
                          id="event_date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          disabled={isSubmitting}
                          className="[&::-webkit-calendar-picker-indicator]:dark:invert"
                        />
                      </div>
                      <div>
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          type="time"
                          id="start_time"
                          required
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          disabled={isSubmitting}
                          className="[&::-webkit-calendar-picker-indicator]:dark:invert"
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <select
                          id="duration"
                          required
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
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

                    {/* Location & Open to Everyone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          disabled={isSubmitting}
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
                            Check this box to invite all co-op members and create an event participant list
                          </Tooltip>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
