'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  TodoWithDetails,
  TodoStatus,
  TodoPriority,
  TodoCategory,
} from '@/types/todos';
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

interface TodoActionsProps {
  todo: TodoWithDetails;
}

export default function TodoActions({ todo }: TodoActionsProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // State Variables for Controlled Inputs
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [todoType, setTodoType] = useState<TodoCategory>(todo.todo_type);
  const [priority, setPriority] = useState<TodoPriority>(todo.priority);
  const [status, setStatus] = useState<TodoStatus>(todo.status);
  const [assignedTo, setAssignedTo] = useState<string | null>(todo.assigned_to);

  // State for User Profiles
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(false);

  // Function to Fetch Profiles
  const fetchProfiles = async () => {
    setIsFetchingProfiles(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        setError('Failed to fetch user profiles.');
        return;
      }

      setProfiles(data || []);
    } catch (err) {
      console.error('Unexpected error fetching profiles:', err);
      setError('An unexpected error occurred while fetching profiles.');
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

      // Update Todo in Supabase
      const { data: updatedTodo, error: updateError } = await supabase
        .from('todos')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          todo_type: todoType,
          status,
          priority,
          assigned_to: assignedTo || null,
        })
        .eq('id', todo.id)
        .select(
          `
        *,
        created_by_user:profiles!todos_created_by_fkey(
          email,
          full_name
        ),
        assigned_to_user:profiles!todos_assigned_to_fkey(
          email,
          full_name
        )
      `
        )
        .single();

      if (updateError) throw updateError;

      // Close Modal and Refresh
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating todo:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update to do item'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Todo Deletion
  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this to do item? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      // Delete todo (comments will be cascade deleted)
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', todo.id);

      if (deleteError) throw deleteError;

      router.push('/todos');
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to delete to do item'
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
        onClick={() => {
          setIsEditDialogOpen(true);
          fetchProfiles(); // Fetch profiles when edit dialog opens
        }}
        disabled={isSubmitting || isDeleting}
      >
        <Edit className="h-4 w-4 mr-1" />
        Edit
      </Button>

      {/* Delete Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit To do</DialogTitle>
          </DialogHeader>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Edit Todo Form */}
          <form onSubmit={handleEdit} className="space-y-4">
            {/* Title Field */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Enter title"
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
                placeholder="Enter description"
                className="min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Todo Type Field */}
            <div>
              <Label htmlFor="todo_type">Type</Label>
              <select
                id="todo_type"
                name="todo_type"
                required
                value={todoType}
                onChange={(e) => setTodoType(e.target.value as TodoCategory)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              >
                <option value="general">General</option>
                <option value="minuted">Minuted Action</option>
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
                onChange={(e) => setPriority(e.target.value as TodoPriority)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Status Field */}
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as TodoStatus)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Assign To Field */}
            <div>
              <Label htmlFor="assigned_to">Assign To</Label>
              <select
                id="assigned_to"
                name="assigned_to"
                value={assignedTo || ''}
                onChange={(e) =>
                  setAssignedTo(e.target.value === '' ? null : e.target.value)
                }
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
                disabled={isFetchingProfiles}
              >
                <option value="">Unassigned</option>
                {isFetchingProfiles ? (
                  <option disabled>Loading...</option>
                ) : (
                  profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name
                        ? `${profile.full_name} (${profile.email})`
                        : profile.email}
                    </option>
                  ))
                )}
              </select>
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