// app/(default)/tasks/page.tsx

import { Metadata } from 'next';
import TaskList from './task-list';
import TaskHeader from './task-header';
import { TaskWithDetails } from '@/types/tasks';
import supabaseAdmin from '@/lib/supabaseAdmin';

export const metadata: Metadata = {
  title: 'Tasks - Co-op Management',
  description: 'View and manage co-op tasks',
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In page.tsx - update getTasks()

async function getTasks() {
  try {
    const { data: tasks, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        created_by_user:profiles!tasks_created_by_fkey(
          email,
          full_name
        ),
        assigned_to_user:profiles!tasks_assigned_to_fkey(
          email,
          full_name
        ),
        comments:task_comments(
          id,
          content,
          created_at,
          created_by,
          user:profiles!task_comments_created_by_fkey(
            email,
            full_name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return tasks;
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return [];
  }
}


export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <TaskHeader />
      <TaskList tasks={tasks} />
    </div>
  );
}
