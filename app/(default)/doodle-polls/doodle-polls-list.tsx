// app/(default)/doodle-polls/doodle-polls-list.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DoodlePoll, DoodleEventType } from '@/types/doodle';
import DoodlePollCard from './doodle-poll-card';

interface DoodlePollsListProps {
  polls: DoodlePoll[];
  currentUserId?: string;
}

const ITEMS_PER_PAGE = 6;

export default function DoodlePollsList({ polls = [], currentUserId }: DoodlePollsListProps) {
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | DoodleEventType,
    sortBy: 'Event Date',
    sortOrder: 'Ascending',
    currentPage: 1,
  });
  const [showClosed, setShowClosed] = useState(false);

  // Load the saved preference when component mounts
  useEffect(() => {
    const savedShowClosed = localStorage.getItem('showClosedPolls');
    if (savedShowClosed !== null) {
      setShowClosed(JSON.parse(savedShowClosed));
    }
  }, []);

  // Save preference whenever it changes
  useEffect(() => {
    localStorage.setItem('showClosedPolls', JSON.stringify(showClosed));
  }, [showClosed]);

  // Filter and sort polls
  const filteredPolls = polls
    .filter((poll) => {
      if (!showClosed && poll.closed) return false;
      if (filters.type !== 'all' && poll.event_type !== filters.type) return false;
      return true;
    })
    .sort((a, b) => {
      const aDate = Math.min(...a.options.map(opt => new Date(opt.date).getTime()));
      const bDate = Math.min(...b.options.map(opt => new Date(opt.date).getTime()));
      return filters.sortOrder === 'Ascending' ? aDate - bDate : bDate - aDate;
    });

  // Compute pagination
  const totalPages = Math.ceil(filteredPolls.length / ITEMS_PER_PAGE);
  const startIndex = (filters.currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredPolls.length);
  const paginatedPolls = filteredPolls.slice(startIndex, endIndex);

  // Get unique event types
  const eventTypes = ['all', ...Array.from(new Set(polls.map(p => p.event_type)))] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={filters.type}
            onValueChange={(value: typeof filters.type) => 
              setFilters(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All' :
                   type === 'social_event' ? 'Co-op Social' :
                   type.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy}
            onValueChange={(value) => 
              setFilters(prev => ({ ...prev, sortBy: value }))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Event Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Event Date">Event Date</SelectItem>
              <SelectItem value="Created Date">Created Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => 
              setFilters(prev => ({ ...prev, sortOrder: value }))
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ascending" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ascending">Ascending</SelectItem>
              <SelectItem value="Descending">Descending</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showClosed ? 'default' : 'outline'}
            onClick={() => setShowClosed(!showClosed)}
            className="w-full sm:w-auto"
          >
            {showClosed ? 'Hide Closed Polls' : 'Show Closed Polls'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPolls.map((poll) => (
          <DoodlePollCard key={poll.id} poll={poll} />
        ))}
      </div>

      {filteredPolls.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No polls found matching your filters
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                currentPage: prev.currentPage - 1,
              }))
            }
            disabled={filters.currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {filters.currentPage} of {totalPages}
          </span>
          <Button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                currentPage: prev.currentPage + 1,
              }))
            }
            disabled={filters.currentPage === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
