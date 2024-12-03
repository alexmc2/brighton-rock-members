// app/(default)/co-op-socials/[id]/social-event-header.tsx

'use client';

import Link from 'next/link';
import { SocialEventWithDetails } from '@/types/social';
import SocialEventActions from './social-event-actions';

interface SocialEventHeaderProps {
  event: SocialEventWithDetails;
}

export default function SocialEventHeader({ event }: SocialEventHeaderProps) {
  return (
    <div className="mb-8">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/co-op-socials"
          className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          ← Back to Co-op Socials
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 sm:flex-nowrap sm:justify-between sm:items-center">
        {/* Left: Title */}
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-2">
            {event.title}
          </h1>
          <div className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Category:{' '}
              {event.category.charAt(0).toUpperCase() +
                event.category.slice(1).replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <SocialEventActions event={event} />
        </div>
      </div>
    </div>
  );
}
