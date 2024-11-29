// app/(default)/garden/task/[id]/task-details.tsx

'use client';

import { format } from 'date-fns';
import { GardenTaskWithDetails } from '@/types/garden';

interface TaskDetailsProps {
  task: GardenTaskWithDetails;
}

export default function TaskDetails({ task }: TaskDetailsProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="px-5 py-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Task Details
        </h2>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
              Description
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
              {task.description}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
              Assigned To
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {task.assigned_to || 'Everyone'}
            </div>
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div>
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
                Due Date
              </h3>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {format(new Date(task.due_date), 'MMM d, yyyy')}
              </div>
            </div>
          )}

          {/* Created At */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
              Created
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {format(new Date(task.created_at), 'MMM d, yyyy h:mm a')}
            </div>
          </div>

          {/* Last Updated */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
              Last Updated
            </h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {format(new Date(task.updated_at), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
