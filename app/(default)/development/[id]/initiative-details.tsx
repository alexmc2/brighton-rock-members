// app/(default)/development/[id]/initiative-details.tsx

import { format } from 'date-fns';
import {
  DevelopmentInitiativeWithDetails,
  DevelopmentStatus,
  DevelopmentPriority,
} from '@/types/development';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Users, PoundSterling, MapPin } from 'lucide-react';

interface InitiativeDetailsProps {
  initiative: DevelopmentInitiativeWithDetails;
}

export default function InitiativeDetails({
  initiative,
}: InitiativeDetailsProps) {
  const getStatusColor = (status: DevelopmentStatus): string => {
    const colors: Record<DevelopmentStatus, string> = {
      active:
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
      completed:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      on_hold:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: DevelopmentPriority): string => {
    const colors: Record<DevelopmentPriority, string> = {
      low: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200',
      medium:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    };
    return colors[priority];
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Description
          </h3>
          <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
            {initiative.description}
          </p>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initiative.event_date && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Event Date
              </h3>
              <div className="flex items-center text-slate-800 dark:text-slate-200">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(initiative.event_date), 'PPP')}
              </div>
            </div>
          )}

          {initiative.start_time && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Start Time
              </h3>
              <div className="flex items-center text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 mr-2" />
                {initiative.start_time}
              </div>
            </div>
          )}

          {initiative.duration && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Duration
              </h3>
              <div className="flex items-center text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 mr-2" />
                {initiative.duration} hours
              </div>
            </div>
          )}

          {initiative.location && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Location
              </h3>
              <div className="flex items-center text-slate-800 dark:text-slate-200">
                <MapPin className="w-4 h-4 mr-2" />
                {initiative.location}
              </div>
            </div>
          )}

          {initiative.max_participants !== null && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Max Participants
              </h3>
              <div className="flex items-center text-slate-800 dark:text-slate-200">
                <Users className="w-4 h-4 mr-2" />
                {initiative.max_participants}
              </div>
            </div>
          )}

          {initiative.budget !== null && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Budget
              </h3>
              <div className="flex items-center text-slate-800 dark:text-slate-200">
                <PoundSterling className="w-4 h-4 mr-2" />£
                {initiative.budget.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              Status
            </h3>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(
                initiative.status as DevelopmentStatus
              )}`}
            >
              {initiative.status.charAt(0).toUpperCase() +
                initiative.status.slice(1).replace('_', ' ')}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              Priority
            </h3>
            <span
              className={`inline-flex px-2.5 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                initiative.priority as DevelopmentPriority
              )}`}
            >
              {initiative.priority.charAt(0).toUpperCase() +
                initiative.priority.slice(1)}
            </span>
          </div>
        </div>

        {/* Created By and Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              Created By
            </h3>
            <p className="text-slate-800 dark:text-slate-200">
              {initiative.created_by_user.full_name ||
                initiative.created_by_user.email}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              Created
            </h3>
            <p className="text-slate-800 dark:text-slate-200">
              {format(new Date(initiative.created_at), 'PPp')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              Last Updated
            </h3>
            <p className="text-slate-800 dark:text-slate-200">
              {format(new Date(initiative.updated_at), 'PPp')}
            </p>
          </div>
        </div>
      </div>
    </Card>

    
  );
}
