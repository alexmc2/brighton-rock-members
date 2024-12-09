// app/(default)/tasks/[id]/task-details.tsx

'use client';

import { format } from 'date-fns';
import { TodoWithDetails, TodoStatus, TodoPriority } from '@/types/todos';

interface TodoDetailsProps {
  todo: TodoWithDetails;
}

export default function TodoDetails({ todo }: TodoDetailsProps) {
  const getStatusBadgeStyle = (status: TodoStatus) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
      in_progress: 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      completed: 'bg-green-500/20 text-green-600 dark:bg-green-500/10 dark:text-green-400',
      cancelled: 'bg-slate-400/20 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400',
      todo: 'bg-slate-400/20 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400',
    } as const;
    return styles[status] || styles.pending;
  };

  const getPriorityBadgeStyle = (priority: TodoPriority) => {
    const styles = {
      low: 'bg-slate-400/20 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400',
      medium: 'bg-blue-500/20 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      high: 'bg-orange-500/20 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
      urgent: 'bg-red-500/20 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    } as const;
    return styles[priority] || styles.medium;
  };

  const formatStatus = (status: TodoStatus) => {
    const formats = {
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      pending: 'Pending',
      todo: 'To Do',
    } as const;
    return formats[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="px-5 py-4">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            To do Details
          </h2>
        </div>

        <div className="space-y-4">
          {/* Status and Priority Badges */}
          <div className="flex flex-wrap gap-2">
            <div className={`text-xs inline-flex font-medium ${getStatusBadgeStyle(todo.status)} rounded-full text-center px-2.5 py-1`}>
              {formatStatus(todo.status)}
            </div>
            {todo.priority && (
              <div className={`text-xs inline-flex font-medium ${getPriorityBadgeStyle(todo.priority)} rounded-full text-center px-2.5 py-1`}>
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
              Description
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto">
              {todo.description || '-'}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
              Assigned To
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {todo.assigned_to_user?.full_name ||
                todo.assigned_to_user?.email ||
                '-'}
            </div>
          </div>

          {/* Due Date */}
          {todo.due_date && (
            <div>
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
                Due Date
              </h3>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {format(new Date(todo.due_date), 'MMM d, yyyy')}
              </div>
            </div>
          )}

          {/* Created At */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
              Created
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {format(new Date(todo.created_at), 'MMM d, yyyy h:mm a')}
            </div>
          </div>

          {/* Last Updated */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
              Last Updated
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {format(new Date(todo.updated_at), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
