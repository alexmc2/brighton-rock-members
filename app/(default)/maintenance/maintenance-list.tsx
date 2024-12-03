'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  MaintenanceRequestWithDetails,
  MaintenanceStatus,
  MaintenancePriority,
} from '@/types/maintenance';
import { Button } from '@/components/ui/button';

interface MaintenanceListProps {
  requests: MaintenanceRequestWithDetails[];
}

const ITEMS_PER_PAGE = 10;

export default function MaintenanceList({ requests }: MaintenanceListProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | MaintenanceStatus>(
    'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<
    'all' | MaintenancePriority
  >('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter requests based on selected filters
  const filteredRequests = requests.filter((request) => {
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && request.priority !== priorityFilter)
      return false;
    return true;
  });

  // Calculate pagination
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Reset pagination when filters change
  const handleFilterChange = (
    filterType: 'status' | 'priority',
    value: string
  ) => {
    setCurrentPage(1); // Reset to first page
    if (filterType === 'status') {
      setStatusFilter(value as 'all' | MaintenanceStatus);
    } else if (filterType === 'priority') {
      setPriorityFilter(value as 'all' | MaintenancePriority);
    }
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    const colors = {
      pending:
        'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
      scheduled:
        'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
      in_progress:
        'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200',
      completed:
        'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
      cancelled:
        'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200',
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: MaintenancePriority) => {
    const colors = {
      low: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
      medium:
        'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-600 dark:text-red-400 dark:bg-red-600/20',
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
          {[
            'pending',
            'scheduled',
            'in_progress',
            'completed',
            'cancelled',
          ].map((status) => (
            <Button
              key={status}
              onClick={() => handleFilterChange('status', status)}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
            >
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace('_', ' ')}
            </Button>
          ))}
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

      {/* Maintenance Requests Table */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="table-auto w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/20">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                  House
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 hidden lg:table-cell">
                  Reported By
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 hidden lg:table-cell">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 hidden md:table-cell">
                  Next P4P Visit
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {paginatedRequests.map((request) => {
                const nextVisit = request.visits
                  .filter(
                    (v) =>
                      !v.completed_at && new Date(v.scheduled_date) > new Date()
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.scheduled_date).getTime() -
                      new Date(b.scheduled_date).getTime()
                  )[0];

                return (
                  <tr key={request.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/maintenance/${request.id}`}
                        className="font-medium text-coop-600 dark:text-coop-400 hover:underline"
                      >
                        {request.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{request.house.name}</td>
                    <td className="px-4 py-3">
                      <div
                        className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1).replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`inline-flex font-medium rounded-full text-center px-2.5 py-0.5 ${getPriorityColor(
                          request.priority
                        )}`}
                      >
                        {request.priority.charAt(0).toUpperCase() +
                          request.priority.slice(1)}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {request.reported_by_user.full_name ||
                        request.reported_by_user.email}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {request.assigned_to_user?.full_name ||
                        request.assigned_to_user?.email ||
                        '-'}
                    </td>
                    <td className="px-4 py-3">
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {nextVisit
                        ? format(
                            new Date(nextVisit.scheduled_date),
                            'MMM d, yyyy h:mm a'
                          )
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {request.comments.length}
                    </td>
                  </tr>
                );
              })}
              {paginatedRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-slate-500 dark:text-slate-400"
                  >
                    No maintenance requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
