// app/(default)/garden/task/[id]/task-actions.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  GardenTaskPriority,
  GardenTaskStatus,
  GardenTaskWithDetails,
} from '@/types/garden';
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
import { Edit, Trash2 } from 'lucide-react';
import { createGardenTaskEvent } from '@/lib/actions/calendar';

interface TaskActionsProps {
  task: GardenTaskWithDetails;
}

export default function TaskActions({ task }: TaskActionsProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setError(null);
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
        .select('full_name')
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

      // Update garden task
      const { data: updatedTask, error: updateError } = await supabase
        .from('garden_tasks')
        .update({
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          area_id: formData.get('area_id') as string,
          priority: formData.get('priority') as GardenTaskPriority,
          due_date: (formData.get('due_date') as string) || null,
          scheduled_time: (formData.get('scheduled_time') as string) || null,
          assigned_to: (formData.get('assigned_to') as string) || 'Everyone',
          status: formData.get('status') as GardenTaskStatus,
          duration: durationInterval,
        })
        .eq('id', task.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Handle calendar event
      if (formData.get('due_date')) {
        await createGardenTaskEvent(
          formData.get('title') as string,
          formData.get('description') as string,
          formData.get('due_date') as string,
          (formData.get('scheduled_time') as string) || null,
          durationValue,
          user.id,
          profile.full_name,
          task.id
        );
      }

      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating task:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update task'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this task? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      // First delete all comments
      const { error: commentsError } = await supabase
        .from('garden_comments')
        .delete()
        .eq('task_id', task.id);

      if (commentsError) throw commentsError;

      // Then delete the task
      const { error: deleteError } = await supabase
        .from('garden_tasks')
        .delete()
        .eq('id', task.id);

      if (deleteError) throw deleteError;

      router.push('/garden');
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to parse duration for default value
  const parseDurationToValue = (duration: string | null): string => {
    if (!duration) return '';
    if (duration === '24 hours') return '24';
    const hoursMatch = duration.match(/([\d.]+)\s*hours?/);
    if (hoursMatch) {
      return hoursMatch[1];
    }
    return '';
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            disabled={isUpdating || isDeleting}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Job
          </Button>
        </DialogTrigger>

        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-slate-900 dark:text-slate-300">Title</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={task.title}
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-900 dark:text-slate-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                defaultValue={task.description}
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
                  defaultValue={task.area_id}
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
                  defaultValue={task.priority}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status" className="text-slate-900 dark:text-slate-300">Status</Label>
                <select
                  id="status"
                  name="status"
                  required
                  defaultValue={task.status}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <Label htmlFor="assigned_to" className="text-slate-900 dark:text-slate-300">Assigned To</Label>
                <Input
                  id="assigned_to"
                  name="assigned_to"
                  defaultValue={task.assigned_to || 'Everyone'}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="due_date" className="text-slate-900 dark:text-slate-300">Due Date</Label>
                <Input
                  type="date"
                  id="due_date"
                  name="due_date"
                  defaultValue={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>

              <div>
                <Label htmlFor="scheduled_time" className="text-slate-900 dark:text-slate-300">Time</Label>
                <Input
                  type="time"
                  id="scheduled_time"
                  name="scheduled_time"
                  defaultValue={task.scheduled_time || ''}
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-slate-900 dark:text-slate-300">Duration</Label>
                <select
                  id="duration"
                  name="duration"
                  defaultValue={parseDurationToValue(task.duration)}
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
                disabled={isUpdating}
                className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete Task
      </Button>
    </div>
  );
}
