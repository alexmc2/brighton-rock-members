// app/(default)/todos/todo-list.tsx

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
  TodoWithDetails,
  TodoPriority,
  TodoStatus,
  TodoCategory,
} from '@/types/todos';
import { Button } from '@/components/ui/button';

interface TodoListProps {
  tasks: TodoWithDetails[];
}

const ITEMS_PER_PAGE = 10;

export default function TodoList({ tasks }: TodoListProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | TodoStatus>('all');
  const [todoTypeFilter, setTodoTypeFilter] = useState<'all' | TodoCategory>(
    'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<'all' | TodoPriority>(
    'all'
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (todoTypeFilter !== 'all' && task.todo_type !== todoTypeFilter)
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
        setStatusFilter(value as 'all' | TodoStatus);
        break;
      case 'type':
        setTodoTypeFilter(value as 'all' | TodoCategory);
        break;
      case 'priority':
        setPriorityFilter(value as 'all' | TodoPriority);
        break;
    }
  };

  const getStatusColor = (status: TodoStatus) => {
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
    } as const;
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: TodoPriority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
      medium:
        'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    } as const;
    return colors[priority] || colors.medium;
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Status Filters */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400"></div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleFilterChange('status', 'all')}
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              className={
                statusFilter === 'all'
                  ? ''
                  : 'text-coop-600 hover:bg-coop-50 dark:hover:bg-coop-950 dark:text-coop-400'
              }
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
                  className={
                    statusFilter === status
                      ? ''
                      : 'text-coop-600 hover:bg-coop-50 dark:hover:bg-coop-950 dark:text-coop-400'
                  }
                  size="sm"
                >
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace('_', ' ')}
                </Button>
              )
            )}
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-700" />

        {/* Type Filters */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400"></div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleFilterChange('type', 'all')}
              variant={todoTypeFilter === 'all' ? 'default' : 'outline'}
              className={`${
                todoTypeFilter === 'all'
                  ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950'
              } border-blue-200 dark:border-blue-800`}
              size="sm"
            >
              All Types
            </Button>
            <Button
              onClick={() => handleFilterChange('type', 'general')}
              variant={todoTypeFilter === 'general' ? 'default' : 'outline'}
              className={`${
                todoTypeFilter === 'general'
                  ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950'
              } border-blue-200 dark:border-blue-800`}
              size="sm"
            >
              General
            </Button>
            <Button
              onClick={() => handleFilterChange('type', 'minuted')}
              variant={todoTypeFilter === 'minuted' ? 'default' : 'outline'}
              className={`${
                todoTypeFilter === 'minuted'
                  ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  : 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950'
              } border-blue-200 dark:border-blue-800`}
              size="sm"
            >
              Minuted Actions
            </Button>
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-700" />

        {/* Priority Filters */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400"></div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleFilterChange('priority', 'all')}
              variant={priorityFilter === 'all' ? 'default' : 'outline'}
              className={`${
                priorityFilter === 'all'
                  ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
                  : 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950'
              } border-purple-100 dark:border-purple-900/50`}
              size="sm"
            >
              All Priorities
            </Button>
            {['low', 'medium', 'high', 'urgent'].map((priority) => (
              <Button
                key={priority}
                onClick={() => handleFilterChange('priority', priority)}
                variant={priorityFilter === priority ? 'default' : 'outline'}
                className={`${
                  priorityFilter === priority
                    ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
                    : 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950'
                } border-purple-100 dark:border-purple-900/50`}
                size="sm"
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="relative w-full">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <Table className="min-w-[1000px] w-full divide-y divide-slate-200 dark:divide-slate-700 rounded-lg">
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                    <TableRow>
                      <TableHead className="w-[20%] px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Title
                      </TableHead>
                      <TableHead className="w-[15%] px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Type
                      </TableHead>
                      <TableHead className="w-[10%] px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Status
                      </TableHead>
                      <TableHead className="w-[10%] px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Priority
                      </TableHead>
                      <TableHead className="w-[15%] px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 hidden lg:table-cell">
                        Assigned To
                      </TableHead>
                      <TableHead className="w-[15%] px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Created
                      </TableHead>
                      <TableHead className="w-[5%] px-4 py-3 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Comments
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="px-4 py-3">
                          <Link
                            href={`/todos/${task.id}`}
                            className="font-medium text-coop-600 dark:text-coop-400 hover:underline"
                          >
                            {task.title}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {task.todo_type === 'minuted'
                            ? 'Minuted Action'
                            : 'General'}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div
                            className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status.charAt(0).toUpperCase() +
                              task.status.slice(1).replace('_', ' ')}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
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
                        <TableCell className="px-4 py-3 hidden lg:table-cell">
                          {task.assigned_to_user?.full_name ||
                            task.assigned_to_user?.email ||
                            '-'}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {format(new Date(task.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          {task.comments.length}
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedTasks.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-slate-500 dark:text-slate-400"
                        >
                          No to do items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination section - update styles */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <nav
              className="mb-4 sm:mb-0 sm:order-1"
              role="navigation"
              aria-label="Navigation"
            >
              <ul className="flex justify-center">
                <li className="ml-3 first:ml-0">
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    &lt;- Previous
                  </Button>
                </li>
                <li className="ml-3 first:ml-0">
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next -&gt;
                  </Button>
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
