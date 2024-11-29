// app/(default)/garden/task/[id]/task-header.tsx

'use client';

import Link from 'next/link';
import { GardenTaskWithDetails } from '@/types/garden';
import TaskActions from './task-actions';

interface TaskHeaderProps {
  task: GardenTaskWithDetails;
}

export default function TaskHeader({ task }: TaskHeaderProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 dark:text-yellow-400',
      in_progress: 'text-blue-600 dark:text-blue-400',
      completed: 'text-green-600 dark:text-green-400',
      cancelled: 'text-slate-600 dark:text-slate-400',
    };
    return colors[status as keyof typeof colors];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-slate-600 dark:text-slate-400',
      medium: 'text-blue-600 dark:text-blue-400',
      high: 'text-orange-600 dark:text-orange-400',
      urgent: 'text-red-600 dark:text-red-400',
    };
    return colors[priority as keyof typeof colors];
  };

  return (
    <div className="mb-8">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/garden"
          className="text-sm font-medium text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
        >
          ← Back to Garden
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 sm:flex-nowrap sm:justify-between sm:items-start">
        {/* Left: Title and Area */}
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-2">
            {task.title}
          </h1>
          <div className="text-sm space-y-1">
            <div className="text-slate-500 dark:text-slate-400">
              Area: {task.area.name}
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              Assigned to: {task.assigned_to || 'Everyone'}
            </div>
            {task.due_date && (
              <div className="text-slate-500 dark:text-slate-400">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status, Priority, and Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className={`inline-flex font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {task.status.charAt(0).toUpperCase() +
                task.status.slice(1).replace('_', ' ')}
            </div>
            <div
              className={`inline-flex font-medium ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </div>
          </div>
          <TaskActions task={task} />
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="mt-4 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
          {task.description}
        </div>
      )}
    </div>
  );
}
