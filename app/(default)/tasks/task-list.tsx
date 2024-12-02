// app/(default)/tasks/task-list.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TaskWithDetails,
  TaskPriority,
  TaskStatus,
  TaskCategory,
} from '@/types/tasks';
import { Button } from '@/components/ui/button';

interface TaskListProps {
  tasks: TaskWithDetails[];
}

const ITEMS_PER_PAGE = 10;

export default function TaskList({ tasks }: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState<'all' | TaskCategory>(
    'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>(
    'all'
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (taskTypeFilter !== 'all' && task.task_type !== taskTypeFilter)
      return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter)
      return false;
    return true;
  });

  // Calculate pagination
  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset pagination when filters change
  const handleFilterChange = (
    filterType: 'status' | 'type' | 'priority',
    value: string
  ) => {
    setCurrentPage(1); // Reset to first page
    switch (filterType) {
      case 'status':
        setStatusFilter(value as 'all' | TaskStatus);
        break;
      case 'type':
        setTaskTypeFilter(value as 'all' | TaskCategory);
        break;
      case 'priority':
        setPriorityFilter(value as 'all' | TaskPriority);
        break;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      pending:
        'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
      in_progress:
        'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
      completed:
        'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
      cancelled:
        'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200',
      todo: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200',
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
      medium:
        'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleFilterChange('status', 'all')}
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All Status
          </Button>
          {['todo', 'in_progress', 'completed', 'cancelled', 'pending'].map(
            (status) => (
              <Button
                key={status}
                onClick={() => handleFilterChange('status', status)}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
              >
                {status.charAt(0).toUpperCase() +
                  status.slice(1).replace('_', ' ')}
              </Button>
            )
          )}
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleFilterChange('type', 'all')}
            variant={taskTypeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All Types
          </Button>
          <Button
            onClick={() => handleFilterChange('type', 'general')}
            variant={taskTypeFilter === 'general' ? 'default' : 'outline'}
            size="sm"
          >
            General Tasks
          </Button>
          <Button
            onClick={() => handleFilterChange('type', 'minuted')}
            variant={taskTypeFilter === 'minuted' ? 'default' : 'outline'}
            size="sm"
          >
            Minuted Actions
          </Button>
        </div>

        {/* Priority Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleFilterChange('priority', 'all')}
            variant={priorityFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All Priorities
          </Button>
          {['low', 'medium', 'high', 'urgent'].map((priority) => (
            <Button
              key={priority}
              onClick={() => handleFilterChange('priority', priority)}
              variant={priorityFilter === priority ? 'default' : 'outline'}
              size="sm"
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto px-8">
          <Table className="table-fixed w-full py-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Title</TableHead>
                <TableHead className="w-1/6">Type</TableHead>
                <TableHead className="w-1/6">Status</TableHead>
                <TableHead className="w-1/6">Priority</TableHead>
                <TableHead className="w-1/6">Assigned To</TableHead>
                <TableHead className="w-1/6">Created</TableHead>
                <TableHead className="w-1/12">Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="w-1/4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-green-600 dark:text-green-400 hover:underline"
                    >
                      {task.title}
                    </Link>
                  
                  </TableCell>
                  <TableCell className="w-1/6">
                    {task.task_type === 'minuted'
                      ? 'Minuted Action'
                      : 'General Task'}
                  </TableCell>
                  <TableCell className="w-1/6">
                    <div
                      className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.charAt(0).toUpperCase() +
                        task.status.slice(1).replace('_', ' ')}
                    </div>
                  </TableCell>
                  <TableCell className="w-1/6">
                    {task.priority && (
                      <div
                        className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="w-1/6">
                    {task.assigned_to_user?.full_name ||
                      task.assigned_to_user?.email ||
                      '-'}
                  </TableCell>
                  <TableCell className="w-1/6">
                    {format(new Date(task.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="w-1/12">
                    {task.comments.length}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-slate-500 dark:text-slate-400">
                      No tasks found
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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
                    onClick={goToPreviousPage}
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
                    onClick={goToNextPage}
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
      </div>
    </div>
  );
}
