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
      <div className="mb-4">
        <Link
          href="/co-op-socials"
          className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          ← Back to Co-op Socials
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-2">
            {event.title}
          </h1>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Category:{' '}
              {event.category.charAt(0).toUpperCase() +
                event.category.slice(1).replace('_', ' ')}
            </span>
            <SocialEventActions event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}
