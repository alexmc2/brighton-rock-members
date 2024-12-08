// app/(default)/doodle-polls/[id]/doodle-poll-header.tsx
'use client';

import Link from 'next/link';
import type { DoodlePollWithDetails } from '@/types/doodle';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface DoodlePollHeaderProps {
  poll: DoodlePollWithDetails;
}

export default function DoodlePollHeader({ poll }: DoodlePollHeaderProps) {
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
        {/* <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-2">
            {poll.title}
          </h1>
          <div className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {poll.event_type === 'social_event'
                ? 'Co-op Social'
                : poll.event_type.replace('_', ' ')}
            </span>
          </div>
        </div> */}
{/* 
        Placeholder buttons for future implementation (currently commented out): */}
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
       
      </div>
    </div>
  );
}
