// app/(default)/doodle-polls/doodle-poll-card.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  Clock,
  MessageSquare,
  PartyPopper,
  Code,
  Users2,
  Home,
  Sprout,
  GraduationCap,
  Wrench,
  PoundSterling,
  Boxes,
  Presentation,
  ScrollText,
  Vote,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DoodlePoll, DoodleEventType } from '@/types/doodle';
import { Badge } from '@/components/ui/badge';

interface DoodlePollCardProps {
  poll: DoodlePoll;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Helper function to get category icon
const getCategoryIcon = (eventType: DoodleEventType) => {
  const icons: Record<DoodleEventType, JSX.Element> = {
    social_event: <PartyPopper className="w-5 h-5" />,
    development_event: <Code className="w-5 h-5" />,
    'General Meeting': <Users2 className="w-5 h-5" />,
    'Sub Meeting': <Presentation className="w-5 h-5" />,
    Allocations: <Home className="w-5 h-5" />,
    'P4P Visit': <Users2 className="w-5 h-5" />,
    Garden: <Sprout className="w-5 h-5" />,
    AGM: <Vote className="w-5 h-5" />,
    EGM: <Vote className="w-5 h-5" />,
    'General Maintenance': <Wrench className="w-5 h-5" />,
    Training: <GraduationCap className="w-5 h-5" />,
    Treasury: <PoundSterling className="w-5 h-5" />,
    Miscellaneous: <Boxes className="w-5 h-5" />,
  };
  return icons[eventType] || <Boxes className="w-5 h-5" />;
};

// Category colors mapping
const categoryColors: Record<DoodleEventType, string> = {
  'General Meeting':
    'bg-blue-100 text-blue-800 dark:bg-blue-500/30 dark:text-blue-300',
  'Sub Meeting':
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/30 dark:text-indigo-300',
  Allocations:
    'bg-teal-100 text-teal-800 dark:bg-teal-500/30 dark:text-teal-300',
  social_event:
    'bg-green-100 text-green-800 dark:bg-green-500/30 dark:text-green-300',
  'P4P Visit': 'bg-red-100 text-red-800 dark:bg-red-500/30 dark:text-red-300',
  Garden:
    'bg-purple-100 text-purple-800 dark:bg-purple-500/30 dark:text-purple-300',
  AGM: 'bg-orange-100 text-orange-800 dark:bg-orange-500/30 dark:text-orange-300',
  EGM: 'bg-pink-100 text-pink-800 dark:bg-pink-500/30 dark:text-pink-300',
  'General Maintenance':
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/30 dark:text-yellow-300',
  Training: 'bg-lime-100 text-lime-800 dark:bg-lime-500/30 dark:text-lime-300',
  Treasury:
    'bg-amber-100 text-amber-800 dark:bg-amber-500/30 dark:text-amber-300',
  development_event:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-300',
  Miscellaneous:
    'bg-gray-100 text-gray-800 dark:bg-gray-500/30 dark:text-gray-300',
};

const DoodlePollCard: React.FC<DoodlePollCardProps> = ({ poll }) => {
  // Count unique participants with responses (including no responses)
  const participantCount = new Set(
    poll.participants
      .filter((p) =>
        Object.values(p.responses).some(
          (r) => r === 'yes' || r === 'maybe' || r === 'no'
        )
      )
      .map((p) => p.user_id)
  ).size;

  // Get most popular option (only counting yes responses)
  const optionCounts = poll.options.map((option) => ({
    option,
    count: poll.participants.filter((p) => p.responses[option.id] === 'yes')
      .length,
  }));

  const mostPopular = optionCounts.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    optionCounts[0]
  );

  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div
          className={cn(
            'inline-flex items-center px-3 py-1.5 rounded-full text-sm mb-4',
            categoryColors[poll.event_type]
          )}
        >
          {getCategoryIcon(poll.event_type)}
          <span className="ml-1.5">{poll.event_type}</span>
        </div>

        <Link href={`/doodle-polls/${poll.id}`}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 hover:text-green-600 dark:hover:text-green-400">
            {poll.title}
          </h3>
        </Link>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
          {poll.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 mr-2 shrink-0" />
            {poll.options.length} date option
            {poll.options.length !== 1 ? 's' : ''}
          </div>
          {mostPopular && mostPopular.count > 0 && (
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 mr-2 shrink-0" />
              Most popular:{' '}
              {format(new Date(mostPopular.option.date), 'EEE, MMM d')}
              {', '}
              {mostPopular.option.start_time &&
                formatTime(mostPopular.option.start_time)}{' '}
              ({mostPopular.count} available)
            </div>
          )}
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Users className="w-4 h-4 mr-2 shrink-0" />
            {participantCount}{' '}
            {participantCount === 1 ? 'response' : 'responses'}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {poll.closed ? (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200/30 dark:bg-red-500/30 dark:text-red-300 dark:border-red-800/30"
            >
              Closed
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200/30 dark:bg-green-950 dark:text-green-300 dark:border-green-800/30"
            >
              Open
            </Badge>
          )}
          <div className="flex items-center gap-4">
            <Link
              href={`/doodle-polls/${poll.id}`}
              className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              View Details →
            </Link>
          </div>
        </div>

        {/* <div className="flex items-center gap-2">
          {poll.closed && (
            <Badge variant="secondary" className="bg-slate-200 text-slate-700">
              Closed
            </Badge>
          )}
          {poll.event_id && (
            <Link 
              href={`/${poll.event_type === 'social_event' ? 'co-op-socials' : 'development-events'}/${poll.event_id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View Event
            </Link>
          )}
        </div> */}
      </div>
    </Card>
  );
};

export default DoodlePollCard;
