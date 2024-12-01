// app/(default)/development/initiative-list.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  DevelopmentInitiativeWithDetails,
  DevelopmentStatus,
  DevelopmentPriority,
  DevelopmentCategory,
} from '@/types/development';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InitiativeListProps {
  initiatives?: DevelopmentInitiativeWithDetails[];
}

const ITEMS_PER_PAGE = 5;

export default function InitiativeList({
  initiatives = [],
}: InitiativeListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalItems = initiatives.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedInitiatives = initiatives.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getStatusColor = (status: DevelopmentStatus): string => {
    const colors: Record<DevelopmentStatus, string> = {
      active:
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
      completed:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      on_hold:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    };
    return colors[status];
  };

  const getCategoryColor = (category: DevelopmentCategory): string => {
    const colors: Record<DevelopmentCategory, string> = {
      development_meeting:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
      social:
        'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
      outreach:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      policy:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
      training:
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
      research:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
      general:
        'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200',
    };
    return colors[category];
  };

  return (
    <div>
      {/* Initiatives List */}
      <div className="grid grid-cols-1 gap-6">
        {paginatedInitiatives.map((initiative) => (
          <Card key={initiative.id}>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <Link href={`/development/${initiative.id}`}>
                      {initiative.title}
                    </Link>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap break-words">
                    {initiative.description}
                  </p>
                  {/* Additional Information */}
                  <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {initiative.location && (
                      <div>Location: {initiative.location}</div>
                    )}
                    {initiative.event_date && (
                      <div>
                        Event Date:{' '}
                        {format(new Date(initiative.event_date), 'MMM d, yyyy')}
                      </div>
                    )}
                    {initiative.start_time && (
                      <div>Start Time: {initiative.start_time}</div>
                    )}
                    {initiative.max_participants && (
                      <div>Max Participants: {initiative.max_participants}</div>
                    )}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                      initiative.category
                    )}`}
                  >
                    {initiative.category.charAt(0).toUpperCase() +
                      initiative.category.slice(1).replace('_', ' ')}
                  </span>
                  <span
                    className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      initiative.status
                    )}`}
                  >
                    {initiative.status.charAt(0).toUpperCase() +
                      initiative.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Created by:{' '}
                  {initiative.created_by_user.full_name ||
                    initiative.created_by_user.email}
                </div>
                <Link
                  href={`/development/${initiative.id}`}
                  className="text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
                >
                  View Details
                </Link>
              </div>
            </div>
          </Card>
        ))}
        {paginatedInitiatives.length === 0 && (
          <div className="text-center text-slate-500 dark:text-slate-400">
            No initiatives found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <Button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
