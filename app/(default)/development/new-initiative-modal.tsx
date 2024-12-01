// app/(default)/development/new-initiative-modal.tsx

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
import { Plus } from 'lucide-react';
import { DevelopmentCategory, DevelopmentPriority } from '@/types/development';

export default function NewInitiativeModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // State Variables for Controlled Inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DevelopmentCategory>('general');
  const [priority, setPriority] = useState<DevelopmentPriority>('medium');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get Current User
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Prepare data for insertion
      const data: any = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        created_by: user.id,
        event_date: eventDate ? new Date(eventDate).toISOString() : null,
        start_time: startTime || null,
        location: location.trim() || null,
        max_participants: maxParticipants
          ? parseInt(maxParticipants, 10)
          : null,
      };

      // Insert Initiative into Supabase
      const { error: insertError } = await supabase
        .from('development_initiatives')
        .insert(data);

      if (insertError) throw insertError;

      // Reset Form Fields
      setTitle('');
      setDescription('');
      setCategory('general');
      setPriority('medium');
      setEventDate('');
      setStartTime('');
      setLocation('');
      setMaxParticipants('');

      // Close Modal and Refresh Page
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating initiative:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create initiative'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button to Open Modal */}
      <Button onClick={() => setIsOpen(true)} variant="default">
        <Plus className="h-4 w-4 mr-2" />
        Add Initiative
      </Button>

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Development Initiative</DialogTitle>
          </DialogHeader>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Initiative Creation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-md py-5"
              />
            </div>

            {/* Description Field */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Describe the initiative"
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

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
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-md px-3 py-2 "
              >
                <option value="general">General</option>
                <option value="development_meeting">Development Meeting</option>
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
                className="w-full h-10  rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-md px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Event Date Field */}
            <div>
              <Label htmlFor="event_date">Event Date</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full h-10  rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-md px-3 py-2"
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
                className="w-full h-10  rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-md px-3 py-2"
              />
            </div>

            {/* Location Field */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Event location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10  rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-md px-3 py-2"
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
                className="w-full h-10  rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-md px-3 py-2"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
