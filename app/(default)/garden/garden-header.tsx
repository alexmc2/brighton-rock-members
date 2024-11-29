// app/(default)/garden/garden-header.tsx

'use client';

import NewGardenTaskModal from './new-garden-task-modal';

export default function GardenHeader() {
  return (
    <div className="sm:flex sm:justify-between sm:items-center mb-8">
      {/* Left: Title */}
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold">
          Garden 🌱
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
        <NewGardenTaskModal />
      </div>
    </div>
  );
}
