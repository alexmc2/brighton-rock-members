// app/(default)/doodle-polls/[id]/doodle-poll-actions.tsx

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Info, Plus, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip } from '@/components/ui/tooltip';
import {
  DoodlePollWithDetails,
  DoodleEventType,
  DoodlePollOption,
} from '@/types/doodle';

interface DoodlePollActionsProps {
  poll: DoodlePollWithDetails;
  onPollUpdate?: (updatedPoll: DoodlePollWithDetails | null) => void;
}

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

export default function DoodlePollActions({
  poll,
  onPollUpdate,
}: DoodlePollActionsProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description);
  const [eventType, setEventType] = useState<DoodleEventType>(poll.event_type);
  const [category, setCategory] = useState(poll.category);
  const [location, setLocation] = useState(poll.location || '');
  const [hasDeadline, setHasDeadline] = useState(!!poll.response_deadline);
  const [deadlineDate, setDeadlineDate] = useState(
    poll.response_deadline
      ? new Date(poll.response_deadline).toISOString().slice(0, 10)
      : ''
  );
  const [deadlineTime, setDeadlineTime] = useState(
    poll.response_deadline
      ? new Date(poll.response_deadline).toISOString().slice(11, 16)
      : ''
  );
  const [dateOptions, setDateOptions] = useState<DoodlePollOption[]>(
    poll.options
  );

  const currentEventType = eventTypeOptions.find(
    (et) => et.value === eventType
  );
  const categories = currentEventType?.categories || [];

  const handleAddDateOption = () => {
    const newOption: DoodlePollOption = {
      id: `temp-${Date.now()}`,
      poll_id: poll.id,
      date: new Date().toISOString().slice(0, 10), // Today's date as default
      start_time: '', // Empty by default so user must specify
      duration: '', // Empty by default so user must specify
      created_at: new Date().toISOString(),
    };
    setDateOptions([...dateOptions, newOption]);
  };

  const handleRemoveDateOption = (optionId: string) => {
    setDateOptions(dateOptions.filter((option) => option.id !== optionId));
  };

  const handleUpdateDateOption = (
    optionId: string,
    field: keyof DoodlePollOption,
    value: string
  ) => {
    setDateOptions(
      dateOptions.map((option) =>
        option.id === optionId ? { ...option, [field]: value } : option
      )
    );
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let response_deadline = null;
      if (hasDeadline && deadlineDate && deadlineTime) {
        response_deadline = new Date(
          `${deadlineDate}T${deadlineTime}`
        ).toISOString();
      }

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        event_type: eventType,
        category,
        location: location.trim() || null,
        response_deadline,
        updated_at: new Date().toISOString(),
      };

      // Format options to match database expectations
      const formattedOptions = dateOptions.map((opt) => ({
        id: opt.id.startsWith('temp-') ? null : opt.id,
        date: new Date(opt.date).toISOString().split('T')[0],
        start_time: opt.start_time,
        duration: opt.duration,
      }));

      // Call the update function
      const { error: updateError } = await supabase.rpc('update_doodle_poll', {
        p_poll_id: poll.id,
        p_poll_data: updateData,
        p_options: formattedOptions,
      });

      if (updateError) throw updateError;

      // Fetch the updated poll with all relations
      const { data: fetchedPoll, error: fetchError } = await supabase
        .from('doodle_polls')
        .select(
          `
        *,
        created_by_user:profiles!doodle_polls_created_by_fkey(email, full_name),
        options:doodle_poll_options(*),
        participants:doodle_poll_participants(
          *,
          user:profiles(email, full_name)
        )
      `
        )
        .eq('id', poll.id)
        .single();

      if (fetchError) throw fetchError;

      if (fetchedPoll) {
        onPollUpdate?.(fetchedPoll as DoodlePollWithDetails);
      }

      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating poll:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update poll'
      );
      onPollUpdate?.(poll);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Delete the poll first
      const { error: deleteError } = await supabase
        .from('doodle_polls')
        .delete()
        .eq('id', poll.id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Success - update UI and redirect
      onPollUpdate?.(null);
      setShowDeleteDialog(false);
      router.push('/doodle-polls');
    } catch (error) {
      console.error('Error deleting poll:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete poll'
      );
      onPollUpdate?.(poll);
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
          disabled={isSubmitting}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>

        <DialogContent className="w-full max-w-lg bg-white dark:bg-slate-800 max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              Edit Doodle Poll
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}
          <form
            onSubmit={handleEdit}
            className="space-y-4 overflow-y-auto flex-1 pr-2"
          >
            {/* Event Type & Category */}
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
                      Set an optional deadline for responses. After this time,
                      no new responses can be added.
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

            {/* Date Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Date Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDateOption}
                  disabled={isSubmitting}
                  className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Date Option
                </Button>
              </div>

              <div className="space-y-2">
                {dateOptions.map((option) => (
                  <div
                    key={option.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-2 items-center p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <Input
                      type="date"
                      value={option.date}
                      onChange={(e) =>
                        handleUpdateDateOption(
                          option.id,
                          'date',
                          e.target.value
                        )
                      }
                      disabled={isSubmitting}
                      required
                      className="w-full bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                    />
                    <Input
                      type="time"
                      value={option.start_time || ''}
                      onChange={(e) =>
                        handleUpdateDateOption(
                          option.id,
                          'start_time',
                          e.target.value
                        )
                      }
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Duration in hours (e.g., 1.5)"
                        value={option.duration || ''}
                        onChange={(e) =>
                          handleUpdateDateOption(
                            option.id,
                            'duration',
                            e.target.value
                          )
                        }
                        min="0.5"
                        step="0.5"
                        disabled={isSubmitting}
                        className="w-full sm:w-24 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [appearance:auto]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDateOption(option.id)}
                        disabled={isSubmitting}
                        className="shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />{' '}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isSubmitting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this poll?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete the poll
              and all its options and participants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700 dark:bg-red-600"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Poll'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
