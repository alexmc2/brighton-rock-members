// app/(default)/co-op-socials/social-event-card.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  PartyPopper,
  Film,
  Music,
  UtensilsCrossed,
  Dice5,
  Tv,
  BookOpen,
  Gift,
  Bike,
  Smile,
  Sun,
  PenTool,
  MessageSquare,
} from 'lucide-react';
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
  const icons: Record<SocialEventCategory, JSX.Element> = {
    film_night: <Film className="w-5 h-5" />,
    album_night: <Music className="w-5 h-5" />,
    meal: <UtensilsCrossed className="w-5 h-5" />,
    fire: <Smile className="w-5 h-5" />,
    board_games: <Dice5 className="w-5 h-5" />,
    tv: <Tv className="w-5 h-5" />,
    book_club: <BookOpen className="w-5 h-5" />,
    christmas_dinner: <Gift className="w-5 h-5" />,
    bike_ride: <Bike className="w-5 h-5" />,
    party: <PartyPopper className="w-5 h-5" />,
    hang_out: <Smile className="w-5 h-5" />,
    beach: <Sun className="w-5 h-5" />,
    writing_club: <PenTool className="w-5 h-5" />,
  };
  return icons[category] || <PartyPopper className="w-5 h-5" />;
};

const categoryColors: Record<SocialEventCategory, string> = {
  film_night:
    'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300',
  album_night:
    'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300',
  meal: 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300',
  fire: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300',
  board_games:
    'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300',
  tv: 'bg-pink-100 text-pink-800 dark:bg-pink-800/30 dark:text-pink-300',
  book_club: 'bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-300',
  christmas_dinner:
    'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300',
  bike_ride:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300',
  party:
    'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300',
  hang_out:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300',
  beach: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-800/30 dark:text-cyan-300',
  writing_club:
    'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
};

const statusColors: Record<SocialEventStatus, string> = {
  upcoming:
    'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300',
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const SocialEventCard: React.FC<SocialEventCardProps> = ({ event }) => {
  const getParticipantCount = () => {
    if (!event.participants) return 0;
    return event.participants.filter((p) => p.status !== 'not_going').length;
  };

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-slate-800 shadow-xs rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div
            className={`flex items-center px-3 py-1.5 rounded-full ${
              categoryColors[event.category]
            }`}
          >
            {getCategoryIcon(event.category)}
            <span className="ml-1.5 text-sm capitalize">
              {event.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        <Link href={`/co-op-socials/${event.id}`}>
          <h3 className="text-lg lg:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2 hover:text-green-600 dark:hover:text-green-400">
            {event.title}
          </h3>
        </Link>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {event.description}
        </p>

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
              {getParticipantCount()} / 12 participants
            </div>
          )}
        </div>

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
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <MessageSquare className="w-4 h-4 mr-1" />
              {event.comments?.length || 0}
            </div>
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
