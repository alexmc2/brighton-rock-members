// app/(default)/tasks/[id]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { TaskWithDetails, TaskComment } from '@/types/tasks';
import CommentSection from '@/components/ui/comments-section';
import TaskHeader from './task-header';
import TaskDetails from './task-details';

export const metadata: Metadata = {
  title: 'Task Details - Co-op Management',
  description: 'View and manage task details',
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTask(id: string) {
  try {
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .select(
        `
        *,
        created_by_user:profiles!tasks_created_by_fkey(email, full_name),
        assigned_to_user:profiles!tasks_assigned_to_fkey(email, full_name),
        comments:task_comments(
          *,
          user:profiles!task_comments_created_by_fkey(
            email,
            full_name
          )
        )
      `
      )
      .eq('id', id)
      .order('created_at', { foreignTable: 'task_comments', ascending: true })
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return task as TaskWithDetails;
  } catch (err) {
    console.error('Error fetching task:', err);
    return null;
  }
}

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const task = await getTask(params.id);

  if (!task) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <TaskHeader task={task} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 space-y-6">
          <TaskDetails task={task} />
          <CommentSection<TaskComment>
            comments={task.comments}
            resourceId={task.id}
            resourceType={{
              type: 'task',
              field: 'task_id',
              contentField: 'content',
              userField: 'created_by',
            }}
          />
        </div>
      </div>
    </div>
  );
}
