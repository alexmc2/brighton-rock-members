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
    development_meeting: <Users2 className="w-5 h-5" />,
    social: <Users className="w-5 h-5" />,
    outreach: <Globe2 className="w-5 h-5" />,
    policy: <BookOpen className="w-5 h-5" />,
    training: <GraduationCap className="w-5 h-5" />,
    research: <Code className="w-5 h-5" />,
    general: <Rocket className="w-5 h-5" />,
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
      'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300',
    completed:
      'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300',
    on_hold:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300',
  };

  const priorityColors: Record<DevelopmentPriority, string> = {
    low: 'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-700/50 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-700/50 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-700/50 dark:text-red-300',
  };

  const categoryColors: Record<DevelopmentCategory, string> = {
    development_meeting:
      'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300',
    social: 'bg-pink-100 text-pink-800 dark:bg-pink-800/30 dark:text-pink-300',
    outreach:
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-800/30 dark:text-cyan-300',
    policy:
      'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300',
    training:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-300',
    research:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300',
    general: 'bg-rose-100 text-rose-800 dark:bg-rose-800/30 dark:text-rose-300',
  };

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <div className="p-5 flex flex-col h-full">
        {/* Header with Type Badge and Category - Updated sizing and alignment */}
        <div className="flex justify-between items-center mb-4 pl-0">
          <Badge
            className={`mb-0 px-3 py-1.5 text-sm ${
              isEvent
                ? 'bg-green-100/80 text-green-800 dark:bg-green-800/40 dark:text-green-300'
                : 'bg-blue-100/80 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300'
            }`}
          >
            {isEvent ? (
              <Calendar className="w-4 h-4 mr-1.5" />
            ) : (
              <LayoutPanelLeft className="w-4 h-4 mr-1.5" />
            )}
            {isEvent ? 'Event' : 'Project'}
          </Badge>
          <div
            className={`flex items-center px-3 py-1.5 rounded-full ${
              categoryColors[initiative.category]
            }`}
          >
            {getCategoryIcon(initiative.category)}
            <span className="ml-1.5 text-sm capitalize">
              {initiative.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/development/${initiative.id}`}>
          <h3 className="text-lg lg:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2 hover:text-green-600 dark:hover:text-green-400">
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
                {initiative.participants?.filter(
                  (p) => p.status !== 'not_going'
                ).length || 0}{' '}
                / 12 participants
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
