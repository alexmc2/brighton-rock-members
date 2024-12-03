// app/(default)/todos/new-todo-modal.tsx

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

// Define the Profile type based on your profiles table
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

export default function NewTodoModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // **State Variables for Controlled Inputs**
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [todoType, setTodoType] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);

  // **State for User Profiles**
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(false);

  // **Function to Fetch Profiles**
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      // Insert Todo into Supabase
      const { data: newTodo, error: insertError } = await supabase
        .from('todos')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          todo_type: todoType,
          status: 'pending',
          priority,
          created_by: user.id,
          assigned_to: assignedTo || null,
        })
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

      if (insertError) throw insertError;

      // Reset Form Fields
      setTitle('');
      setDescription('');
      setTodoType('general');
      setPriority('medium');
      setAssignedTo(null);

      // Refresh Page and Close Modal
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating todo:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create todo'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* **Trigger Button to Open Modal and Fetch Profiles** */}
      <Button
        onClick={() => {
          setIsOpen(true);
          fetchProfiles(); // Fetch profiles when modal opens
        }}
        variant="default"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Todo
      </Button>

      {/* **Modal Dialog** */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Todo</DialogTitle>
          </DialogHeader>

          {/* **Error Message** */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* **Todo Creation Form** */}
          <form onSubmit={handleSubmit} className="space-y-4 ">
            {/* **Title Field** */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Enter todo title"
                value={title}
                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 dark:text-slate-100 text-md py-5"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* **Description Field** */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Enter todo description"
                className="min-h-[100px] dark:bg-slate-700 dark:text-slate-100"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* **Todo Type Field** */}
            <div>
              <Label htmlFor="todo_type">Todo Type</Label>
              <select
                id="todo_type"
                name="todo_type"
                required
                value={todoType}
                onChange={(e) => setTodoType(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 dark:text-slate-100 px-3 py-2"
              >
                <option value="general">General</option>
                <option value="minuted">Minuted Action</option>
              </select>
            </div>

            {/* **Priority Field** */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                required
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 dark:text-slate-100 px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* **Assign To Field** */}
            <div>
              <Label htmlFor="assigned_to">Assign To</Label>
              <select
                id="assigned_to"
                name="assigned_to"
                value={assignedTo || ''}
                onChange={(e) =>
                  setAssignedTo(e.target.value === '' ? null : e.target.value)
                }
                className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 dark:text-slate-100 px-3 py-2"
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

            {/* **Form Actions** */}
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
                {isSubmitting ? 'Creating...' : 'Create Todo'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
