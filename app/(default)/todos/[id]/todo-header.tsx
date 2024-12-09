// app/(default)/tasks/[id]/task-header.tsx

'use client';

import Link from 'next/link';
import { TodoWithDetails } from '@/types/todos';
import TodoActions from './todo-actions';

interface TodoHeaderProps {
  todo: TodoWithDetails;
}

export default function TodoHeader({ todo }: TodoHeaderProps) {
  return (
    <div className="mb-8">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/todos"
          className="text-sm font-medium text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
        >
          ← Back to To do
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-2">
            {todo.title}
          </h1>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Type: {todo.todo_type === 'minuted' ? 'Minuted Action' : 'General'}
            </div>
            <TodoActions todo={todo} />
          </div>
        </div>
      </div>
    </div>
  );
}
