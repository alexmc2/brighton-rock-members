'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SocialEventWithDetails,
  SocialEventCategory,
  SocialEventStatus,
} from '@/types/social';
import SocialEventCard from './social-event-card';
import { useCallback, useEffect } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface SocialEventsListProps {
  events?: SocialEventWithDetails[];
}

const ITEMS_PER_PAGE = 6;

type SortField = 'created_at' | 'event_date';
type SortOrder = 'asc' | 'desc';

export default function SocialEventsList({
  events: initialEvents = [],
}: SocialEventsListProps) {
  const supabase = createClientComponentClient();

  // State management
  const [events, setEvents] = useState(initialEvents);
  const [filters, setFilters] = useState({
    category: 'all' as 'all' | SocialEventCategory,
    status: 'all' as 'all' | SocialEventStatus,
    sortField: 'event_date' as SortField,
    sortOrder: 'asc' as SortOrder,
    currentPage: 1,
  });

  // Memoized filter and sort function
  const getFilteredAndSortedEvents = useCallback(
    (eventsList: SocialEventWithDetails[]) => {
      return eventsList
        .filter((event) => {
          if (filters.category !== 'all' && event.category !== filters.category)
            return false;
          if (filters.status !== 'all' && event.status !== filters.status)
            return false;
          return true;
        })
        .sort((a, b) => {
          const aValue = a[filters.sortField];
          const bValue = b[filters.sortField];

          if (!aValue && !bValue) return 0;
          if (!aValue) return filters.sortOrder === 'asc' ? 1 : -1;
          if (!bValue) return filters.sortOrder === 'asc' ? -1 : 1;

          const comparison = aValue > bValue ? 1 : -1;
          return filters.sortOrder === 'asc' ? comparison : -comparison;
        });
    },
    [filters]
  );

  // Real-time subscription handler
  const handleRealtimeUpdate = useCallback(
    async (
      payload: RealtimePostgresChangesPayload<{
        event_id: string;
        user_id: string;
        status: string;
      }> & {
        new: { event_id: string; user_id: string; status: string } | null;
        old: { event_id: string; user_id: string; status: string } | null;
      }
    ) => {
      const eventId = (payload.new || payload.old)?.event_id;
      if (!eventId) return;

      const { data: participants } = await supabase
        .from('social_event_participants')
        .select(
          `
        *,
        user:profiles(
          id,
          email,
          full_name
        )
      `
        )
        .eq('event_id', eventId);

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? { ...event, participants: participants || [] }
            : event
        )
      );
    },
    [supabase]
  );

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('social_event_participants_changes')
      .on(
        'postgres_changes' as never,
        {
          event: '*',
          schema: 'public',
          table: 'social_event_participants',
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, handleRealtimeUpdate]);

  // Update events when initialEvents prop changes
  useEffect(() => {
    if (JSON.stringify(events) !== JSON.stringify(initialEvents)) {
      setEvents(initialEvents);
    }
  }, [initialEvents]);

  // Compute pagination
  const filteredAndSortedEvents = getFilteredAndSortedEvents(events);
  const totalPages = Math.ceil(filteredAndSortedEvents.length / ITEMS_PER_PAGE);
  const startIndex = (filters.currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredAndSortedEvents.length
  );
  const paginatedEvents = filteredAndSortedEvents.slice(startIndex, endIndex);

  // Compute unique categories and statuses
  const categories = [
    'all',
    ...Array.from(new Set(events.map((e) => e.category))),
  ] as Array<'all' | SocialEventCategory>;
  const statuses = [
    'all',
    ...Array.from(new Set(events.map((e) => e.status))),
  ] as Array<'all' | SocialEventStatus>;

  const formatFilterLabel = (value: string): string => {
    if (value === 'all') return 'All';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Select
          value={filters.category}
          onValueChange={(value: 'all' | SocialEventCategory) => {
            setFilters((prev) => ({
              ...prev,
              category: value,
              currentPage: 1,
            }));
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
          value={filters.status}
          onValueChange={(value: 'all' | SocialEventStatus) => {
            setFilters((prev) => ({ ...prev, status: value, currentPage: 1 }));
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

        <Select
          value={filters.sortField}
          onValueChange={(value: SortField) => {
            setFilters((prev) => ({
              ...prev,
              sortField: value,
              currentPage: 1,
            }));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="event_date">Event Date</SelectItem>
            <SelectItem value="created_at">Created Date</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder}
          onValueChange={(value: SortOrder) => {
            setFilters((prev) => ({
              ...prev,
              sortOrder: value,
              currentPage: 1,
            }));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedEvents.map((event) => (
          <SocialEventCard key={event.id} event={event} />
        ))}
      </div>

      {paginatedEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">
            No events found matching your filters
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
