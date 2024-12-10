// app/(default)/garden/task/[id]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { GardenTaskWithDetails, GardenComment } from '@/types/garden';
import CommentSection from '@/components/ui/comments-section';
import TaskHeader from './task-header';
import TaskDetails from './task-details';

export const metadata: Metadata = {
  title: 'Garden Task - Co-op Management',
  description: 'View and manage Garden Task details',
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getGardenTask(id: string) {
  try {
    const { data: task, error } = await supabaseAdmin
      .from('garden_tasks')
      .select(
        `
    *,
    area:garden_areas!garden_tasks_area_id_fkey(
      id,
      name,
      description
    ),
    comments:garden_comments(
      *,
      user:profiles!garden_comments_user_id_fkey(
        email,
        full_name
      )
    )
  `
      )
      .eq('id', id)
      .order('created_at', { foreignTable: 'garden_comments', ascending: true })
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return task as GardenTaskWithDetails;
  } catch (err) {
    console.error('Error fetching Garden Task:', err);
    return null;
  }
}

interface GardenTaskPageProps {
  params: {
    id: string;
  };
}

export default async function GardenTaskPage({ params }: GardenTaskPageProps) {
  const task = await getGardenTask(params.id);

  if (!task) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <TaskHeader task={task} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 space-y-6">
          <TaskDetails task={task} />
          <CommentSection<GardenComment>
            comments={task.comments}
            resourceId={task.id}
            resourceType={{
              type: 'garden',
              field: 'task_id',
              contentField: 'comment',
              userField: 'user_id',
            }}
          />
        </div>
      </div>
    </div>
  );
}
