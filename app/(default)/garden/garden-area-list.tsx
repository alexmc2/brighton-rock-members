// app/(default)/garden/garden-area-list.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  GardenAreaWithDetails,
  GardenTaskStatus,
  GardenTask,
  GardenComment,
} from '@/types/garden';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GardenAreaListProps {
  areas: GardenAreaWithDetails[];
}

interface GardenTaskWithComments extends GardenTask {
  comments: GardenComment[];
}

const ITEMS_PER_PAGE = 10;

export default function GardenAreaList({ areas }: GardenAreaListProps) {
  const [statusFilter, setStatusFilter] = useState<GardenTaskStatus | 'all'>(
    'all'
  );
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});

  const getStatusColor = (status: GardenTaskStatus) => {
    const colors = {
      pending:
        'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
      in_progress:
        'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
      completed:
        'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
      cancelled:
        'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
      medium:
        'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    };
    return colors[priority.toLowerCase()] || colors.medium;
  };

  const getCurrentPage = (areaId: string) => {
    return currentPages[areaId] || 1;
  };

  const handlePageChange = (areaId: string, newPage: number) => {
    setCurrentPages((prev) => ({
      ...prev,
      [areaId]: newPage,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All Status
          </Button>
          {['pending', 'in_progress', 'completed', 'cancelled'].map(
            (status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status as GardenTaskStatus)}
              >
                {status.charAt(0).toUpperCase() +
                  status.slice(1).replace('_', ' ')}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Garden Areas */}
      {areas.map((area) => {
        const filteredTasks = area.tasks.filter(
          (task) => statusFilter === 'all' || task.status === statusFilter
        );

        if (statusFilter !== 'all' && filteredTasks.length === 0) {
          return null;
        }

        // Pagination calculations for this area
        const currentPage = getCurrentPage(area.id);
        const totalItems = filteredTasks.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
        const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

        return (
          <div
            key={area.id}
            className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700"
          >
            {/* Area Header */}
            <div className="px-8 py-4">
              <div className="flex flex-wrap justify-between items-center">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                  {area.name}
                </h2>
                <Link
                  href={`/garden/area/${area.id}`}
                  className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
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
            <div className="relative w-full">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden px-8">
                    <Table className="min-w-[800px] w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[20%]">Job Title</TableHead>
                          <TableHead className="w-[14%]">Status</TableHead>
                          <TableHead className="w-[14%]">Priority</TableHead>
                          <TableHead className="w-[14%]">Created</TableHead>
                          <TableHead className="w-[14%]">Due Date</TableHead>
                          <TableHead className="w-[14%]">Assigned To</TableHead>
                          <TableHead className="w-[10%]">Comments</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(paginatedTasks as GardenTaskWithComments[]).map(
                          (task) => (
                            <TableRow key={task.id}>
                              <TableCell>
                                <Link
                                  href={`/garden/${task.id}`}
                                  className="font-medium text-green-600 dark:text-green-400 hover:underline"
                                >
                                  {task.title}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <div
                                  className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${getStatusColor(
                                    task.status
                                  )}`}
                                >
                                  {task.status.charAt(0).toUpperCase() +
                                    task.status.slice(1).replace('_', ' ')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div
                                  className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${getPriorityColor(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority.charAt(0).toUpperCase() +
                                    task.priority.slice(1)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {task.created_at
                                  ? format(
                                      new Date(task.created_at),
                                      'MMM d, yyyy'
                                    )
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {task.due_date
                                  ? format(
                                      new Date(task.due_date),
                                      'MMM d, yyyy'
                                    )
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {task.assigned_to && task.assigned_to.trim()
                                  ? task.assigned_to
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {task.comments.length}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                        {paginatedTasks.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="text-slate-500 dark:text-slate-400">
                                No tasks found
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            {filteredTasks.length > 0 && (
              <div className="px-8 py-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <nav
                    className="mb-4 sm:mb-0 sm:order-1"
                    role="navigation"
                    aria-label="Navigation"
                  >
                    <ul className="flex justify-center">
                      <li className="ml-3 first:ml-0">
                        <button
                          onClick={() =>
                            handlePageChange(area.id, currentPage - 1)
                          }
                          disabled={currentPage === 1}
                          className={`btn ${
                            currentPage === 1
                              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-300 dark:text-gray-600'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          &lt;- Previous
                        </button>
                      </li>
                      <li className="ml-3 first:ml-0">
                        <button
                          onClick={() =>
                            handlePageChange(area.id, currentPage + 1)
                          }
                          disabled={currentPage >= totalPages}
                          className={`btn ${
                            currentPage >= totalPages
                              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-300 dark:text-gray-600'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          Next -&gt;
                        </button>
                      </li>
                    </ul>
                  </nav>
                  <div className="text-sm text-gray-500 text-center sm:text-left">
                    Showing{' '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {startIndex + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {endIndex}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {totalItems}
                    </span>{' '}
                    results
                  </div>
                </div>
              </div>
            )}

            {/* Plants Summary */}
            {area.plants.length > 0 && (
              <div className="px-8 py-3 border-t border-slate-200 dark:border-slate-700">
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
