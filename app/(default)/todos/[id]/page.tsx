// app/(default)/todos/[id]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { TodoWithDetails, TodoComment } from '@/types/todos';
import CommentSection from '@/components/ui/comments-section';
import TodoHeader from './todo-header';
import TodoDetails from './todo-details';

export const metadata: Metadata = {
  title: 'To do Details - Co-op Management',
  description: 'View and manage to do item details',
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTodo(id: string) {
  try {
    const { data: todo, error } = await supabaseAdmin
      .from('todos')
      .select(
        `
        *,
        created_by_user:profiles!todos_created_by_fkey(email, full_name),
        assigned_to_user:profiles!todos_assigned_to_fkey(email, full_name),
        comments:todo_comments(
          *,
          user:profiles!todo_comments_created_by_fkey(
            email,
            full_name
          )
        )
      `
      )
      .eq('id', id)
      .order('created_at', { foreignTable: 'todo_comments', ascending: true })
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return todo as TodoWithDetails;
  } catch (err) {
    console.error('Error fetching todo:', err);
    return null;
  }
}

interface TodoDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TodoDetailPage({ params }: TodoDetailPageProps) {
  const todo = await getTodo(params.id);

  if (!todo) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <TodoHeader todo={todo} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 space-y-6">
          <TodoDetails todo={todo} />
          <CommentSection<TodoComment>
            comments={todo.comments}
            resourceId={todo.id}
            resourceType={{
              type: "todo",
              field: "todo_id",
              contentField: "content",
              userField: "created_by"
            }}
          />
        </div>
      </div>
    </div>
  );
}
