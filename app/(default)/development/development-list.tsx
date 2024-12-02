'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import InitiativeCard from './initiative-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DevelopmentInitiativeWithDetails,
  DevelopmentCategory,
  DevelopmentStatus,
  InitiativeType, // Make sure to import this from your updated types
} from '@/types/development';

interface InitiativeListProps {
  initiatives?: DevelopmentInitiativeWithDetails[];
}

const ITEMS_PER_PAGE = 9;

export default function InitiativeList({
  initiatives = [],
}: InitiativeListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<'all' | InitiativeType>('all');
  const [categoryFilter, setStatusFilter] = useState<
    'all' | DevelopmentCategory
  >('all');
  const [statusFilter, setCategoryFilter] = useState<'all' | DevelopmentStatus>(
    'all'
  );

  // Filter initiatives
  const filteredInitiatives = initiatives.filter((initiative) => {
    if (typeFilter !== 'all' && initiative.initiative_type !== typeFilter)
      return false;
    if (categoryFilter !== 'all' && initiative.category !== categoryFilter)
      return false;
    if (statusFilter !== 'all' && initiative.status !== statusFilter)
      return false;
    return true;
  });

  // Pagination logic
  const totalItems = filteredInitiatives.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedInitiatives = filteredInitiatives.slice(startIndex, endIndex);

  // Get unique categories and statuses from initiatives
  const categories: Array<'all' | DevelopmentCategory> = [
    'all',
    ...(Array.from(
      new Set(initiatives.map((i) => i.category))
    ) as DevelopmentCategory[]),
  ];

  const statuses: Array<'all' | DevelopmentStatus> = [
    'all',
    ...(Array.from(
      new Set(initiatives.map((i) => i.status))
    ) as DevelopmentStatus[]),
  ];

  const formatFilterLabel = (value: string): string => {
    if (value === 'all') return 'All';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select
          value={typeFilter}
          onValueChange={(value: 'all' | InitiativeType) => {
            setTypeFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="project">Projects</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(value: 'all' | DevelopmentCategory) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {formatFilterLabel(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value: 'all' | DevelopmentStatus) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {formatFilterLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid of Initiative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedInitiatives.map((initiative) => (
          <InitiativeCard key={initiative.id} initiative={initiative} />
        ))}
      </div>

      {/* Empty State */}
      {paginatedInitiatives.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No initiatives found matching your filters
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
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