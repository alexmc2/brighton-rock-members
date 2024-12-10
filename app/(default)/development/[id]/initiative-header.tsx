// app/(default)/development/[id]/initiative-header.tsx

'use client';

import Link from 'next/link';
import {
  DevelopmentInitiativeWithDetails,
  DevelopmentStatus,
} from '@/types/development';
import DevelopmentActions from './initiative-actions';

interface InitiativeHeaderProps {
  initiative: DevelopmentInitiativeWithDetails;
}

export default function InitiativeHeader({
  initiative,
}: InitiativeHeaderProps) {
  const getStatusColor = (status: DevelopmentStatus): string => {
    const colors: Record<DevelopmentStatus, string> = {
      active: 'text-green-600 dark:text-green-400',
      completed: 'text-blue-600 dark:text-blue-400',
      on_hold: 'text-yellow-600 dark:text-yellow-400',
      cancelled: 'text-red-600 dark:text-red-400',
    };
    return colors[status];
  };

  return (
    <div className="mb-8">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/development"
          className="text-sm font-medium text-coop-600 hover:text-coop-700 dark:text-coop-400 dark:hover:text-coop-300"
        >
          ← Back to Development Projects and Events
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 sm:flex-nowrap sm:justify-between sm:items-center">
        {/* Left: Title */}
        {/* <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-2">
            {initiative.title}
          </h1>
          <div className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Category:{' '}
              {initiative.category.charAt(0).toUpperCase() +
                initiative.category.slice(1).replace('_', ' ')}
            </span>
          </div>
        </div> */}
        <DevelopmentActions initiative={initiative} />

        {/* Right: Status and Actions */}
        {/* <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            <div
              className={`inline-flex font-medium ${getStatusColor(
                initiative.status as DevelopmentStatus
              )}`}
            >
              {initiative.status.charAt(0).toUpperCase() +
                initiative.status.slice(1).replace('_', ' ')}
            </div>
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}
