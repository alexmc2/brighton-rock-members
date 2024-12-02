// app/(default)/development/initiative-card.tsx

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  LayoutPanelLeft,
  BookOpen,
  Users2,
  Rocket,
  Code,
  GraduationCap,
  Globe2,
  MessageSquare,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DevelopmentInitiativeWithDetails,
  DevelopmentCategory,
  DevelopmentStatus,
  DevelopmentPriority,
  ParticipationStatus,
} from '@/types/development';

interface InitiativeCardProps {
  initiative: DevelopmentInitiativeWithDetails;
  onParticipate?: (
    initiativeId: string,
    status: ParticipationStatus
  ) => Promise<void>;
}

// Helper function to get category icon
const getCategoryIcon = (category: DevelopmentCategory) => {
  const icons: Record<DevelopmentCategory, JSX.Element> = {
    development_meeting: <Users2 className="w-4 h-4" />,
    social: <Users className="w-4 h-4" />,
    outreach: <Globe2 className="w-4 h-4" />,
    policy: <BookOpen className="w-4 h-4" />,
    training: <GraduationCap className="w-4 h-4" />,
    research: <Code className="w-4 h-4" />,
    general: <Rocket className="w-4 h-4" />,
  };
  return icons[category];
};

// Helper function to format time to 12-hour format
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const InitiativeCard: React.FC<InitiativeCardProps> = ({
  initiative,
  onParticipate,
}) => {
  const isEvent = initiative.initiative_type === 'event';

  const statusColors: Record<DevelopmentStatus, string> = {
    active:
      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    completed:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    on_hold:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  };

  const priorityColors: Record<DevelopmentPriority, string> = {
    low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
  };

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <div className="p-5 flex flex-col h-full">
        {/* Header with Type Badge and Category */}
        <div className="flex justify-between items-start mb-4">
          <Badge variant={isEvent ? 'default' : 'secondary'} className="mb-2">
            {isEvent ? (
              <Calendar className="w-3 h-3 mr-1" />
            ) : (
              <LayoutPanelLeft className="w-3 h-3 mr-1" />
            )}
            {isEvent ? 'Event' : 'Project'}
          </Badge>
          <div className="flex items-center">
            {getCategoryIcon(initiative.category)}
            <span className="ml-1 text-xs text-slate-600 dark:text-slate-400">
              {initiative.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/development/${initiative.id}`}>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2 hover:text-green-600 dark:hover:text-green-400">
            {initiative.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {initiative.description}
        </p>

        {/* Event Details */}
        {isEvent && (
          <div className="space-y-2 mb-4">
            {initiative.event_date && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(initiative.event_date), 'EEEE, MMMM do yyyy')}
              </div>
            )}
            {initiative.start_time && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(initiative.start_time)}
              </div>
            )}
            {initiative.location && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 mr-2" />
                {initiative.location}
              </div>
            )}
            {initiative.open_to_everyone && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Users className="w-4 h-4 mr-2" />
                {initiative.participants?.length || 0} / 12 participants
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                statusColors[initiative.status]
              }`}
            >
              {initiative.status.replace('_', ' ')}
            </span>
            <span
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                priorityColors[initiative.priority]
              }`}
            >
              {initiative.priority}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <MessageSquare className="w-4 h-4 mr-1" />
              {initiative.comments?.length || 0}
            </div>
            <Link
              href={`/development/${initiative.id}`}
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

export default InitiativeCard;
