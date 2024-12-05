// // app/(default)/co-op-socials/social-events-list.tsx

// 'use client';

// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import SocialEventCard from './social-event-card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   SocialEventWithDetails,
//   SocialEventCategory,
//   SocialEventStatus,
// } from '@/types/social';

// interface SocialEventsListProps {
//   events?: SocialEventWithDetails[];
// }

// const ITEMS_PER_PAGE = 9;

// export default function SocialEventsList({
//   events = [],
// }: SocialEventsListProps) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [categoryFilter, setCategoryFilter] = useState<
//     'all' | SocialEventCategory
//   >('all');
//   const [statusFilter, setStatusFilter] = useState<'all' | SocialEventStatus>(
//     'all'
//   );
  

//   // Filter events
//   const filteredEvents = events.filter((event) => {
//     if (categoryFilter !== 'all' && event.category !== categoryFilter)
//       return false;
//     if (statusFilter !== 'all' && event.status !== statusFilter) return false;
//     return true;
//   });

//   // Pagination logic
//   const totalItems = filteredEvents.length;
//   const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
//   const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

//   // Get unique categories and statuses from events
//   const categories: Array<'all' | SocialEventCategory> = [
//     'all',
//     ...(Array.from(
//       new Set(events.map((e) => e.category))
//     ) as SocialEventCategory[]),
//   ];

//   const statuses: Array<'all' | SocialEventStatus> = [
//     'all',
//     ...(Array.from(
//       new Set(events.map((e) => e.status))
//     ) as SocialEventStatus[]),
//   ];

//   const formatFilterLabel = (value: string): string => {
//     if (value === 'all') return 'All';
//     return value
//       .split('_')
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   };

//   return (
//     <div className="space-y-6">
//       {/* Filters */}
//       <div className="flex flex-wrap gap-4">
//         <Select
//           value={categoryFilter}
//           onValueChange={(value: 'all' | SocialEventCategory) => {
//             setCategoryFilter(value);
//             setCurrentPage(1);
//           }}
//         >
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Select category" />
//           </SelectTrigger>
//           <SelectContent>
//             {categories.map((category) => (
//               <SelectItem key={category} value={category}>
//                 {formatFilterLabel(category)}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <Select
//           value={statusFilter}
//           onValueChange={(value: 'all' | SocialEventStatus) => {
//             setStatusFilter(value);
//             setCurrentPage(1);
//           }}
//         >
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Select status" />
//           </SelectTrigger>
//           <SelectContent>
//             {statuses.map((status) => (
//               <SelectItem key={status} value={status}>
//                 {formatFilterLabel(status)}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Grid of Event Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {paginatedEvents.map((event) => (
//           <SocialEventCard key={event.id} event={event} />
//         ))}
//       </div>

//       {/* Empty State */}
//       {paginatedEvents.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-slate-500 dark:text-slate-400">
//             No events found matching your filters
//           </p>
//         </div>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex items-center justify-between">
//           <Button
//             onClick={() => setCurrentPage(currentPage - 1)}
//             disabled={currentPage === 1}
//             variant="outline"
//           >
//             Previous
//           </Button>
//           <span className="text-sm text-slate-600 dark:text-slate-400">
//             Page {currentPage} of {totalPages}
//           </span>
//           <Button
//             onClick={() => setCurrentPage(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             variant="outline"
//           >
//             Next
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }


// app/(default)/co-op-socials/social-events-list.tsx
'use client';

import React, { useState } from 'react';
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

interface SocialEventsListProps {
  events?: SocialEventWithDetails[];
}

const ITEMS_PER_PAGE = 9;

export default function SocialEventsList({
  events = [],
}: SocialEventsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | SocialEventCategory
  >('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SocialEventStatus>(
    'all'
  );

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (categoryFilter !== 'all' && event.category !== categoryFilter)
      return false;
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    return true;
  });

  // Pagination logic
  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

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
