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

export default function TaskList({ tasks }: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState<'all' | TaskCategory>(
    'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>(
    'all'
  );

  // Aligning with MaintenanceList styling for status labels
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

  // Reverting to original priority colors
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

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (taskTypeFilter !== 'all' && task.task_type !== taskTypeFilter)
      return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter)
      return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setStatusFilter('all')}
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All Status
          </Button>
          {['todo', 'in_progress', 'completed', 'cancelled', 'pending'].map(
            (status) => (
              <Button
                key={status}
                onClick={() => setStatusFilter(status as TaskStatus)}
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
            onClick={() => setTaskTypeFilter('all')}
            variant={taskTypeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All Types
          </Button>
          <Button
            onClick={() => setTaskTypeFilter('general')}
            variant={taskTypeFilter === 'general' ? 'default' : 'outline'}
            size="sm"
          >
            General Tasks
          </Button>
          <Button
            onClick={() => setTaskTypeFilter('minuted')}
            variant={taskTypeFilter === 'minuted' ? 'default' : 'outline'}
            size="sm"
          >
            Minuted Actions
          </Button>
        </div>

        {/* Priority Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setPriorityFilter('all')}
            variant={priorityFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All Priorities
          </Button>
          {['low', 'medium', 'high', 'urgent'].map((priority) => (
            <Button
              key={priority}
              onClick={() => setPriorityFilter(priority as TaskPriority)}
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
                {/* Removed "Actions" Header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="w-1/4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-green-600 dark:text-green-400 hover:underline"
                    >
                      {task.title}
                    </Link>
                    {task.description && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {task.description}
                      </div>
                    )}
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
                  {/* Removed "Actions" Cell */}
                </TableRow>
              ))}
              {filteredTasks.length === 0 && (
                <TableRow>
                  {/* Updated colSpan from 8 to 7 */}
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
      </div>
    </div>
  );
}
