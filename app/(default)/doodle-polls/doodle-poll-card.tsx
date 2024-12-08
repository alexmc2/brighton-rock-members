// app/(default)/doodle-polls/doodle-poll-card.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Users, Clock, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DoodlePoll } from '@/types/doodle';

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

const DoodlePollCard: React.FC<DoodlePollCardProps> = ({ poll }) => {
  // Count unique participants with responses
  const participantCount = new Set(
    poll.participants
      .filter((p) =>
        Object.values(p.responses).some((r) => r === 'yes' || r === 'maybe')
      )
      .map((p) => p.user_id)
  ).size;

  // Get most popular option
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
            'inline-flex items-center px-3 py-1 rounded-full text-sm mb-4',
            'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300'
          )}
        >
          {poll.event_type === 'garden_task'
            ? 'Garden Job'
            : poll.event_type === 'social_event'
            ? 'Co-op Social'
            : poll.event_type.replace('_', ' ')}
            
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
              {format(new Date(mostPopular.option.date), 'EEE, MMM d')}{', '}
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
          <div
            className={cn(
              'px-2.5 py-0.5 text-xs font-medium rounded-full',
              'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
            )}
          >
            {poll.closed ? 'closed' : 'upcoming'}
          </div>
          <div className="flex items-center gap-4">
            {/* <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <MessageSquare className="w-4 h-4 mr-1" />
              {poll.options.length}
            </div> */}
            <Link
              href={`/doodle-polls/${poll.id}`}
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

export default DoodlePollCard;
