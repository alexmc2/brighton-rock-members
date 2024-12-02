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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
    initiative.duration?.split(' ')[0] || ''
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
    setError(error instanceof Error ? error.message : 'Failed to delete event');
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleEdit} className="space-y-4">
            {/* Form fields from NewEventModal */}
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
                  className="dark:bg-slate-700"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  required
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as DevelopmentCategory)
                  }
                  disabled={isSubmitting}
                  className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                className="resize-none dark:bg-slate-700"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Date, Time & Duration */}
            <div className="grid grid-cols-3 gap-4">
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
                  className="dark:bg-slate-700"
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
                  className="dark:bg-slate-700"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                  className="dark:bg-slate-700"
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
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as DevelopmentStatus)}
                disabled={isSubmitting}
                className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                required
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as DevelopmentPriority)
                }
                disabled={isSubmitting}
                className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
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
