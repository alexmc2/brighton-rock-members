// app/(default)/development/[id]/development-actions.tsx

'use client';

import { useState, useEffect } from 'react';
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

// Define the Profile type based on your profiles table
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface DevelopmentActionsProps {
  initiative: DevelopmentInitiativeWithDetails;
}

export default function DevelopmentActions({
  initiative,
}: DevelopmentActionsProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // State Variables for Controlled Inputs
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
  const [location, setLocation] = useState(initiative.location || '');
  const [maxParticipants, setMaxParticipants] = useState(
    initiative.max_participants ? initiative.max_participants.toString() : ''
  );

  // State for User Profiles
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(false);

  // Fetch Profiles when modal opens
  useEffect(() => {
    if (isEditDialogOpen) {
      fetchProfiles();
    }
  }, [isEditDialogOpen]);

  const fetchProfiles = async () => {
    setIsFetchingProfiles(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name', { ascending: true });

      if (error) throw error;

      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setIsFetchingProfiles(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get Current User
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Prepare data for update
      const data: any = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
        start_time: startTime || null,
        location: location.trim() || null,
        max_participants: maxParticipants
          ? parseInt(maxParticipants, 10)
          : null,
      };

      // Update Initiative in Supabase
      const { error: updateError } = await supabase
        .from('development_initiatives')
        .update(data)
        .eq('id', initiative.id);

      if (updateError) throw updateError;

      // Close Modal and Refresh
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating initiative:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update initiative'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this initiative? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      // Delete initiative
      const { error: deleteError } = await supabase
        .from('development_initiatives')
        .delete()
        .eq('id', initiative.id);

      if (deleteError) throw deleteError;

      router.push('/development');
    } catch (error) {
      console.error('Error deleting initiative:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete initiative'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Edit Button */}
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsEditDialogOpen(true)}
        disabled={isSubmitting || isDeleting}
      >
        <Edit className="h-4 w-4 mr-1" />
        Edit Initiative
      </Button>

      {/* Delete Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete Initiative
      </Button>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Initiative</DialogTitle>
          </DialogHeader>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Edit Initiative Form */}
          <form onSubmit={handleEdit} className="space-y-4">
            {/* Title Field */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Initiative or event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description Field */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Describe the initiative or event"
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category and Priority Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Field */}
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  required
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as DevelopmentCategory)
                  }
                  className="w-full h-10 rounded-md border px-3 py-2"
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

              {/* Priority Field */}
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  required
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as DevelopmentPriority)
                  }
                  className="w-full h-10 rounded-md border px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Status Field */}
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as DevelopmentStatus)}
                className="w-full h-10 rounded-md border px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Event Date and Start Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Event Date Field */}
              <div>
                <Label htmlFor="event_date">Event Date</Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              {/* Start Time Field */}
              <div>
                <Label htmlFor="start_time">Start Time (Optional)</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>

            {/* Location and Max Participants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location Field */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Event location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Max Participants Field */}
              <div>
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  name="max_participants"
                  type="number"
                  min="1"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
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
