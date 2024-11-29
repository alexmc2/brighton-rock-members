// app/(default)/garden/garden-area-list.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { GardenAreaWithDetails, GardenTaskStatus } from '@/types/garden';
import { Button } from '@/components/ui/button';

interface GardenAreaListProps {
  areas: GardenAreaWithDetails[];
}

export default function GardenAreaList({ areas }: GardenAreaListProps) {
  const [statusFilter, setStatusFilter] = useState<GardenTaskStatus | 'all'>(
    'all'
  );

  const getStatusColor = (status: GardenTaskStatus) => {
    const colors = {
      pending: 'text-yellow-600 dark:text-yellow-400',
      in_progress: 'text-blue-600 dark:text-blue-400',
      completed: 'text-green-600 dark:text-green-400',
      cancelled: 'text-slate-600 dark:text-slate-400',
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All
        </Button>
        {['pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status as GardenTaskStatus)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Garden Areas */}
      {areas.map((area) => {
        const filteredTasks = area.tasks.filter(
          (task) => statusFilter === 'all' || task.status === statusFilter
        );

        if (statusFilter !== 'all' && filteredTasks.length === 0) {
          return null;
        }

        return (
          <div
            key={area.id}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            {/* Area Header */}
            <div className="px-5 py-4">
              <div className="flex flex-wrap justify-between items-center">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                  {area.name}
                </h2>
                <Link
                  href={`/garden/area/${area.id}`}
                  className="text-sm text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
                >
                  View Details →
                </Link>
              </div>
              {area.description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {area.description}
                </p>
              )}
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="table-fixed w-full divide-y divide-slate-200 dark:divide-slate-700">
                {/* Table header */}
                <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20">
                  <tr>
                    <th className="w-[40%] px-4 py-3">
                      <div className="font-semibold text-left">Task</div>
                    </th>
                    <th className="w-[20%] px-4 py-3">
                      <div className="font-semibold text-left">Status</div>
                    </th>
                    <th className="w-[20%] px-4 py-3">
                      <div className="font-semibold text-left">Priority</div>
                    </th>
                    <th className="w-[20%] px-4 py-3">
                      <div className="font-semibold text-left">Due Date</div>
                    </th>
                  </tr>
                </thead>
                {/* Table body */}
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-4 py-3 align-middle">
                        <Link
                          href={`/garden/task/${task.id}`}
                          className="text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300 font-medium"
                        >
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div
                          className={`inline-flex font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.charAt(0).toUpperCase() +
                            task.status.slice(1).replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="text-slate-800 dark:text-slate-100">
                          {task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="text-slate-800 dark:text-slate-100">
                          {task.due_date
                            ? format(new Date(task.due_date), 'MMM d, yyyy')
                            : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                      >
                        No tasks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Plants Summary */}
            {area.plants.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {area.plants.length} plant
                    {area.plants.length !== 1 ? 's' : ''}
                  </span>{' '}
                  in this area
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
