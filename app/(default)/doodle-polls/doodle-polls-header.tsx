// app/(default)/doodle-polls/doodle-polls-header.tsx

'use client';

import NewDoodlePollModal from './new-doodle-poll-modal';
import { CalendarDays } from 'lucide-react';

export default function DoodlePollsHeader() {
  return (
    <div className="sm:flex sm:justify-between sm:items-center mb-8">
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold flex items-center gap-3">
          Doodle Polls ✅
        </h1>
      </div>

      <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
        <NewDoodlePollModal />
      </div>
    </div>
  );
}
