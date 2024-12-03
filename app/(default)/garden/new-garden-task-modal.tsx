// app/(default)/garden/new-garden-task-modal.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GardenTaskPriority } from '@/types/garden';
import { Plus } from 'lucide-react';
import { createGardenTaskEvent } from '@/lib/actions/calendar';

export default function NewGardenTaskModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const supabase = createClientComponentClient();

  const fetchAreas = async () => {
    const { data, error } = await supabase
      .from('garden_areas')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching areas:', error);
      return;
    }

    setAreas(data || []);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      // Prepare duration
      const durationValue = formData.get('duration') as string;
      let durationInterval: string | null = null;
      if (durationValue) {
        if (durationValue === '24') {
          durationInterval = '24 hours';
        } else {
          durationInterval = `${durationValue} hours`;
        }
      }

      // Insert garden task
      const { data: newTask, error: insertError } = await supabase
        .from('garden_tasks')
        .insert({
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          area_id: formData.get('area_id') as string,
          priority: formData.get('priority') as GardenTaskPriority,
          due_date: (formData.get('due_date') as string) || null,
          scheduled_time: (formData.get('scheduled_time') as string) || null,
          assigned_to: (formData.get('assigned_to') as string) || 'Everyone',
          status: 'pending',
          duration: durationInterval,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create calendar event if due date is set
      if (formData.get('due_date') && newTask) {
        await createGardenTaskEvent(
          newTask.title,
          newTask.description,
          newTask.due_date,
          newTask.scheduled_time,
          durationValue,
          user.id,
          profile.full_name,
          newTask.id
        );
      }

      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create task'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              setIsOpen(true);
              fetchAreas();
            }}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-lg bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>New Garden Job</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-900 dark:text-slate-300">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Enter job title"
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-900 dark:text-slate-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Enter job description"
                className="resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area_id" className="text-slate-900 dark:text-slate-300">Area</Label>
                <select
                  id="area_id"
                  name="area_id"
                  required
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="">Select an area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-slate-900 dark:text-slate-300">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  required
                  defaultValue="medium"
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <Label htmlFor="assigned_to" className="text-slate-900 dark:text-slate-300">Assigned To</Label>
                <Input
                  id="assigned_to"
                  name="assigned_to"
                  placeholder="Enter any name"
                  defaultValue="Everyone"
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <Label htmlFor="due_date" className="text-slate-900 dark:text-slate-300">Date</Label>
                <Input
                  type="date"
                  id="due_date"
                  name="due_date"
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>

              <div>
                <Label htmlFor="scheduled_time" className="text-slate-900 dark:text-slate-300">Time</Label>
                <Input
                  type="time"
                  id="scheduled_time"
                  name="scheduled_time"
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-slate-900 dark:text-slate-300">Duration</Label>
                <select
                  id="duration"
                  name="duration"
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

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                variant="default"
              >
                {isSubmitting ? 'Creating...' : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
