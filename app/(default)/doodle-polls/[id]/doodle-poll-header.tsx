'use client';

import Link from 'next/link';
import type { DoodlePollWithDetails } from '@/types/doodle';
import DoodlePollActions from './doodle-poll-actions';
import { useState } from 'react';

interface DoodlePollHeaderProps {
  poll: DoodlePollWithDetails;
}

export default function DoodlePollHeader({ poll }: DoodlePollHeaderProps) {
  const [currentPoll, setCurrentPoll] = useState<DoodlePollWithDetails | null>(
    poll
  );

  if (!currentPoll) {
    // Poll deleted, redirect handled in actions
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <Link
          href="/doodle-polls"
          className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          ← Back to Doodle Polls
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 sm:flex-nowrap sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-2">
            {currentPoll.title}
          </h1>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Event Type: {currentPoll.event_type}
          </div>
        </div>

        <DoodlePollActions
          poll={currentPoll}
          onPollUpdate={(updatedPoll) => setCurrentPoll(updatedPoll)}
        />
      </div>
    </div>
  );
}
