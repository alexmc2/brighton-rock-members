// app/(default)/tasks/[id]/task-header.tsx

'use client';

import Link from 'next/link';
import { TodoWithDetails, TodoStatus, TodoPriority } from '@/types/todos';
import TodoActions from './todo-actions';

interface TodoHeaderProps {
  todo: TodoWithDetails;
}

export default function TodoHeader({ todo }: TodoHeaderProps) {
  const getStatusColor = (status: TodoStatus) => {
    const colors = {
      pending: 'text-yellow-600 dark:text-yellow-400',
      in_progress: 'text-blue-600 dark:text-blue-400',
      completed: 'text-green-600 dark:text-green-400',
      cancelled: 'text-slate-600 dark:text-slate-400',
      todo: 'text-slate-600 dark:text-slate-400',
    } as const;
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: TodoPriority) => {
    const colors = {
      low: 'text-slate-600 dark:text-slate-400',
      medium: 'text-blue-600 dark:text-blue-400',
      high: 'text-orange-600 dark:text-orange-400',
      urgent: 'text-red-600 dark:text-red-400',
    } as const;
    return colors[priority] || colors.medium;
  };

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

      <div className="flex flex-wrap gap-4 sm:flex-nowrap sm:justify-between sm:items-center">
        {/* Left: Title */}
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-2">
            {todo.title}
          </h1>
          <div className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Type:{' '}
              {todo.todo_type === 'minuted' ? 'Minuted Action' : 'General'}
            </span>
          </div>
        </div>

        {/* Right: Status, Priority and Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            <div
              className={`inline-flex font-medium ${getStatusColor(
                todo.status
              )}`}
            >
              {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
            </div>
            {todo.priority && (
              <div
                className={`inline-flex font-medium ${getPriorityColor(
                  todo.priority
                )}`}
              >
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
              </div>
            )}
          </div>
          <TodoActions todo={todo} />
        </div>
      </div>
    </div>
  );
}
