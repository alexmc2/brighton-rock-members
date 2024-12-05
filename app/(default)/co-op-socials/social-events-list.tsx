// app/(default)/co-op-socials/social-events-list.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface SocialEventsListProps {
  events?: SocialEventWithDetails[];
}

const ITEMS_PER_PAGE = 9;

type SortField = 'created_at' | 'event_date';
type SortOrder = 'asc' | 'desc';

export default function SocialEventsList({
  events: initialEvents = [],
}: SocialEventsListProps) {
  const supabase = createClientComponentClient();
  const [events, setEvents] = useState(initialEvents);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | SocialEventCategory
  >('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SocialEventStatus>(
    'all'
  );
  const [sortField, setSortField] = useState<SortField>('event_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Set up real-time subscription for participant updates
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
        async (payload: RealtimePostgresChangesPayload<{
          event_id: string;
          user_id: string;
          status: string;
        }> & {
          new: { event_id: string } | null;
          old: { event_id: string } | null;
        }) => {
          const eventId = payload.new?.event_id || payload.old?.event_id;
          if (!eventId) return;

          // Fetch updated participants for the affected event
          const { data: participants } = await supabase
            .from('social_event_participants')
            .select(`
              *,
              user:profiles(
                id,
                email,
                full_name
              )
            `)
            .eq('event_id', eventId);

          // Update the events state with new participant data
          setEvents((prevEvents) =>
            prevEvents.map((event) => {
              if (event.id === eventId) {
                return {
                  ...event,
                  participants: participants || [],
                };
              }
              return event;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Update local state when props change
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (categoryFilter !== 'all' && event.category !== categoryFilter)
      return false;
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    return true;
  });

  // Sort events
  const sortedAndFilteredEvents = [...filteredEvents].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (!aValue && !bValue) return 0;
    if (!aValue) return sortOrder === 'asc' ? 1 : -1;
    if (!bValue) return sortOrder === 'asc' ? -1 : 1;

    const comparison = aValue > bValue ? 1 : -1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Update pagination to use sorted events
  const totalItems = sortedAndFilteredEvents.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedEvents = sortedAndFilteredEvents.slice(startIndex, endIndex);

  // Get unique categories and statuses
  const categories: Array<'all' | SocialEventCategory> = [
    'all',
    ...(Array.from(
      new Set(events.map((e) => e.category))
    ) as SocialEventCategory[]),
  ];

  const statuses: Array<'all' | SocialEventStatus> = [
    'all',
    ...(Array.from(
      new Set(events.map((e) => e.status))
    ) as SocialEventStatus[]),
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
      <div className="flex flex-wrap gap-4">
        <Select
          value={categoryFilter}
          onValueChange={(value: 'all' | SocialEventCategory) => {
            setCategoryFilter(value);
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
          onValueChange={(value: 'all' | SocialEventStatus) => {
            setStatusFilter(value);
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

        <Select
          value={sortField}
          onValueChange={(value: SortField) => {
            setSortField(value);
            setCurrentPage(1);
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
          value={sortOrder}
          onValueChange={(value: SortOrder) => {
            setSortOrder(value);
            setCurrentPage(1);
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
