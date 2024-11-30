// app/(default)/tasks/[id]/task-header.tsx

'use client';

import Link from 'next/link';
import { TaskWithDetails, TaskStatus, TaskPriority } from '@/types/tasks';
import TaskActions from './task-actions';

interface TaskHeaderProps {
  task: TaskWithDetails;
}

export default function TaskHeader({ task }: TaskHeaderProps) {
  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      pending: 'text-yellow-600 dark:text-yellow-400',
      in_progress: 'text-blue-600 dark:text-blue-400',
      completed: 'text-green-600 dark:text-green-400',
      cancelled: 'text-slate-600 dark:text-slate-400',
      todo: 'text-slate-600 dark:text-slate-400'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      low: 'text-slate-600 dark:text-slate-400',
      medium: 'text-blue-600 dark:text-blue-400',
      high: 'text-orange-600 dark:text-orange-400',
      urgent: 'text-red-600 dark:text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="mb-8">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/tasks"
          className="text-sm font-medium text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
        >
          ← Back to Tasks
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 sm:flex-nowrap sm:justify-between sm:items-center">
        {/* Left: Title */}
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-2">
            {task.title}
          </h1>
          <div className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Type:{' '}
              {task.task_type === 'minuted' ? 'Minuted Action' : 'General Task'}
            </span>
          </div>
        </div>

        {/* Right: Status, Priority and Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            <div
              className={`inline-flex font-medium ${getStatusColor(
                task.status as TaskStatus
              )}`}
            >
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </div>
            {task.priority && (
              <div
                className={`inline-flex font-medium ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            )}
          </div>
          <TaskActions task={task} />
        </div>
      </div>
    </div>
  );
}
