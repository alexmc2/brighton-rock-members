// app/(default)/doodle-polls/new-doodle-poll-modal.tsx

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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X, CalendarDays, Info } from 'lucide-react';
import { DoodlePollOption, DoodleEventType } from '@/types/doodle';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip } from '@/components/tooltip';

interface EventTypeOption {
  value: DoodleEventType;
  label: string;
  categories: Array<{ value: string; label: string }>;
}

const eventTypeOptions: EventTypeOption[] = [
  {
    value: 'social_event',
    label: 'Co-op Social',
    categories: [
      { value: 'film_night', label: 'Film Night' },
      { value: 'album_night', label: 'Album Night' },
      { value: 'meal', label: 'Meal' },
      { value: 'fire', label: 'Fire' },
      { value: 'board_games', label: 'Board Games' },
      { value: 'tv', label: 'TV Night' },
      { value: 'book_club', label: 'Book Club' },
      { value: 'christmas_dinner', label: 'Christmas Dinner' },
      { value: 'bike_ride', label: 'Bike Ride' },
      { value: 'party', label: 'Party' },
      { value: 'hang_out', label: 'Hang Out' },
      { value: 'beach', label: 'Beach' },
      { value: 'writing_club', label: 'Writing Club' },
    ],
  },
  {
    value: 'development_event',
    label: 'Development Event',
    categories: [
      { value: 'development_meeting', label: 'Development Meeting' },
      { value: 'outreach', label: 'Outreach' },
      { value: 'policy', label: 'Policy' },
      { value: 'training', label: 'Training' },
      { value: 'research', label: 'Research' },
      { value: 'general', label: 'General' },
    ],
  },
  {
    value: 'General Meeting',
    label: 'General Meeting',
    categories: [{ value: 'General Meeting', label: 'General Meeting' }],
  },
  {
    value: 'Sub Meeting',
    label: 'Sub Meeting',
    categories: [{ value: 'Sub Meeting', label: 'Sub Meeting' }],
  },
  {
    value: 'Allocations',
    label: 'Allocations',
    categories: [{ value: 'Allocations', label: 'Allocations' }],
  },
  {
    value: 'P4P Visit',
    label: 'P4P Visit',
    categories: [{ value: 'P4P Visit', label: 'P4P Visit' }],
  },
  {
    value: 'Garden',
    label: 'Garden',
    categories: [{ value: 'Garden', label: 'Garden' }],
  },
  {
    value: 'AGM',
    label: 'AGM',
    categories: [{ value: 'AGM', label: 'AGM' }],
  },
  {
    value: 'EGM',
    label: 'EGM',
    categories: [{ value: 'EGM', label: 'EGM' }],
  },
  {
    value: 'General Maintenance',
    label: 'General Maintenance',
    categories: [
      { value: 'General Maintenance', label: 'General Maintenance' },
    ],
  },
  {
    value: 'Training',
    label: 'Training',
    categories: [{ value: 'Training', label: 'Training' }],
  },
  {
    value: 'Treasury',
    label: 'Treasury',
    categories: [{ value: 'Treasury', label: 'Treasury' }],
  },
  {
    value: 'Miscellaneous',
    label: 'Miscellaneous',
    categories: [{ value: 'Miscellaneous', label: 'Miscellaneous' }],
  },
];

export default function NewDoodlePollModal() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<DoodleEventType>('social_event');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [options, setOptions] = useState<
    Array<Omit<DoodlePollOption, 'id' | 'poll_id' | 'created_at'>>
  >([]);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');

  // Get categories based on selected event type
  const currentEventType = eventTypeOptions.find(
    (et) => et.value === eventType
  );
  const categories = currentEventType?.categories || [];

  const addOption = () => {
    const newOption = {
      date: '',
      start_time: null,
      duration: null,
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (
    index: number,
    field: keyof Omit<DoodlePollOption, 'id' | 'poll_id' | 'created_at'>,
    value: string
  ) => {
    setOptions(
      options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      )
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventType('social_event');
    setCategory('');
    setLocation('');
    setOptions([]);
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
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate response deadline if set
      let response_deadline = null;
      if (hasDeadline && deadlineDate && deadlineTime) {
        response_deadline = new Date(
          `${deadlineDate}T${deadlineTime}`
        ).toISOString();
      }

      // First create the poll
      const { data: poll, error: pollError } = await supabase
        .from('doodle_polls')
        .insert({
          title: title.trim(),
          description: description.trim(),
          event_type: eventType,
          category,
          location: location.trim() || null,
          created_by: user.id,
          closed: false,
          event_id: null,
          response_deadline,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Then create all options
      const optionsToCreate = options.map((option) => ({
        poll_id: poll.id,
        date: option.date,
        start_time: option.start_time,
        duration: option.duration,
        created_at: new Date().toISOString(),
      }));

      const { error: optionsError } = await supabase
        .from('doodle_poll_options')
        .insert(optionsToCreate);

      if (optionsError) throw optionsError;

      resetForm();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating poll:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create poll'
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
          New Doodle poll
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-lg bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            New Doodle poll
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="event_type">Event Type</Label>
              <select
                id="event_type"
                required
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value as DoodleEventType);
                  setCategory('');
                }}
                disabled={isSubmitting}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-300 px-3 py-2"
              >
                {eventTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-300 px-3 py-2"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
              className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Date Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Date Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={isSubmitting}
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Date Option
              </Button>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-2 items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                >
                  <Input
                    type="date"
                    value={option.date}
                    onChange={(e) =>
                      updateOption(index, 'date', e.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    className="w-full bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                  />
                  <Input
                    type="time"
                    value={option.start_time || ''}
                    onChange={(e) =>
                      updateOption(index, 'start_time', e.target.value)
                    }
                    required
                    disabled={isSubmitting}
                    className="w-full bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Duration (h)"
                      value={option.duration || ''}
                      onChange={(e) =>
                        updateOption(index, 'duration', e.target.value)
                      }
                      min="0.5"
                      step="0.5"
                      disabled={isSubmitting}
                      className="w-24 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      disabled={isSubmitting}
                      className="shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="hasDeadline"
                label="Set response deadline"
                checked={hasDeadline}
                onChange={(checked) => setHasDeadline(checked as boolean)}
                disabled={isSubmitting}
              />

              <Tooltip
                content={
                  <p className="w-[200px] p-2">
                    Set an optional deadline for poll responses. After this date
                    and time, no new responses will be accepted. If no deadline
                    is set, the poll will remain open indefinitely until
                    manually closed.
                  </p>
                }
                bg="dark"
              >
                <Info className="h-4 w-4 text-slate-500" />
              </Tooltip>
            </div>
          </div>

          {hasDeadline && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadlineDate">Deadline Date</Label>
                <Input
                  id="deadlineDate"
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  disabled={isSubmitting}
                  required={hasDeadline}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadlineTime">Deadline Time</Label>
                <Input
                  id="deadlineTime"
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  disabled={isSubmitting}
                  required={hasDeadline}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || options.length === 0}
              variant="default"
            >
              {isSubmitting ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
