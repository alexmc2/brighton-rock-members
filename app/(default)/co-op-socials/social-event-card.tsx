// app/(default)/co-op-socials/social-event-card.tsx

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Users, Clock, MapPin, PartyPopper } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  SocialEventWithDetails,
  SocialEventCategory,
  SocialEventStatus,
} from '@/types/social';

interface SocialEventCardProps {
  event: SocialEventWithDetails;
}

const getCategoryIcon = (category: SocialEventCategory) => {
  // Map categories to icons
  return <PartyPopper className="w-5 h-5" />;
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const SocialEventCard: React.FC<SocialEventCardProps> = ({ event }) => {
  const statusColors: Record<SocialEventStatus, string> = {
    upcoming:
      'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300',
    completed:
      'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300',
  };

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <div className="p-5 flex flex-col h-full">
        {/* Header with Category */}
        <div className="flex justify-between items-center mb-4">
          <div
            className={`flex items-center px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700`}
          >
            {getCategoryIcon(event.category)}
            <span className="ml-1.5 text-sm capitalize">
              {event.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/co-op-socials/${event.id}`}>
          <h3 className="text-lg lg:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2 hover:text-green-600 dark:hover:text-green-400">
            {event.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {event.event_date && (
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 mr-2" />
              {format(new Date(event.event_date), 'EEEE, MMMM do yyyy')}
            </div>
          )}
          {event.start_time && (
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(event.start_time)}
            </div>
          )}
          {event.location && (
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 mr-2" />
              {event.location}
            </div>
          )}
          {event.open_to_everyone && (
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Users className="w-4 h-4 mr-2" />
              {event.participants?.length || 0} participants
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                statusColors[event.status]
              }`}
            >
              {event.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/co-op-socials/${event.id}`}
              className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SocialEventCard;
