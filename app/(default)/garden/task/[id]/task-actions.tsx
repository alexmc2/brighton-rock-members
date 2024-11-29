// app/(default)/garden/task/[id]/task-actions.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { GardenTaskStatus, GardenTaskWithDetails } from '@/types/garden';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Edit, MoreVertical, Trash2 } from 'lucide-react';

interface TaskActionsProps {
  task: GardenTaskWithDetails;
}

export default function TaskActions({ task }: TaskActionsProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClientComponentClient();

  const statusOptions: GardenTaskStatus[] = [
    'pending',
    'in_progress',
    'completed',
    'cancelled',
  ];

  const handleStatusChange = async (newStatus: GardenTaskStatus) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('garden_tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const formData = new FormData(e.currentTarget);
      const assignedTo = formData.get('assigned_to');

      const { error } = await supabase
        .from('garden_tasks')
        .update({
          title: formData.get('title'),
          description: formData.get('description'),
          assigned_to: assignedTo === '' ? 'Everyone' : assignedTo,
          due_date: formData.get('due_date') || null,
        })
        .eq('id', task.id);

      if (error) throw error;
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating task:', error);
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

  return (
    <div className="flex items-center gap-2">
      {/* Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={isUpdating}
          >
            Change Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusOptions.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={task.status === status}
            >
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace('_', ' ')}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isUpdating || isDeleting}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={task.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={task.description}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                name="assigned_to"
                defaultValue={task.assigned_to || 'Everyone'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                type="date"
                id="due_date"
                name="due_date"
                defaultValue={task.due_date?.split('T')[0] || ''}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
