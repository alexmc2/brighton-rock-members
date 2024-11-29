// app/(default)/maintenance/maintenance-header.tsx

'use client';

import NewRequestModal from './new-request-modal';

// Export the House interface
export interface House {
  id: string;
  name: string;
}

interface MaintenanceHeaderProps {
  houses: House[];
}

export default function MaintenanceHeader({ houses }: MaintenanceHeaderProps) {
  return (
    <div className="sm:flex sm:justify-between sm:items-center mb-8">
      {/* Left: Title */}
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold">
          Maintenance ✨
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
        {/* Pass houses to NewRequestModal */}
        <NewRequestModal houses={houses} />
      </div>
    </div>
  );
}
