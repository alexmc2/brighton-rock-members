// app/(default)/todos/page.tsx

import { Metadata } from 'next';
import TodoList from './todo-list';
import TodoHeader from './todo-header';
import { TodoWithDetails } from '@/types/todos';
import supabaseAdmin from '@/lib/supabaseAdmin';

export const metadata: Metadata = {
  title: 'To do - Co-op Management',
  description: 'View and manage co-op to do items',
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getTodos() {
  try {
    const { data: todos, error } = await supabaseAdmin
      .from('todos')
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
        ),
        comments:todo_comments(
          id,
          content,
          created_at,
          created_by,
          user:profiles!todo_comments_created_by_fkey(
            email,
            full_name
          )
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      return [];
    }

    return todos;
  } catch (err) {
    console.error('Error fetching todos:', err);
    return [];
  }
}

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <TodoHeader />
      <TodoList tasks={todos} />
    </div>
  );
}
