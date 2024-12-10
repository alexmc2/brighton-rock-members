// app/(default)/development/[id]/initiative-details.tsx

'use client';

import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  DevelopmentInitiativeWithDetails,
  DevelopmentStatus,
  DevelopmentPriority,
  ParticipationStatus,
  EventParticipant,
} from '@/types/development';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  Users,
  PoundSterling,
  MapPin,
  LayoutPanelLeft,
  Globe2,
  BookOpen,
  GraduationCap,
  Code,
  Rocket,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getUserColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Users2 } from 'lucide-react';

interface InitiativeDetailsProps {
  initiative: DevelopmentInitiativeWithDetails;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function InitiativeDetails({
  initiative: initialInitiative,
}: InitiativeDetailsProps) {
  const supabase = createClientComponentClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUserStatus, setCurrentUserStatus] =
    useState<ParticipationStatus | null>(null);
  const [initiative, setInitiative] = useState(initialInitiative);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    full_name: string | null;
  } | null>(null);

  // Fetch current user and their participation status on mount
  useEffect(() => {
    async function fetchUserAndStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentUser(profile);

        // Get participation status
        const { data: participation } = await supabase
          .from('event_participants')
          .select('status')
          .eq('event_id', initiative.id)
          .eq('user_id', user.id)
          .single();

        if (participation) {
          setCurrentUserStatus(participation.status as ParticipationStatus);
        }
      }
    }
    fetchUserAndStatus();
  }, [initiative.id, supabase]);

  // Fetch participants and handle realtime updates
  useEffect(() => {
    if (initiative.initiative_type !== 'event') {
      return; // Exit early if not an event
    }

    async function fetchParticipants() {
      const { data, error } = await supabase
        .from('event_participants')
        .select(
          `
        event_id,
        user_id,
        status,
        created_at,
        updated_at,
        user:profiles!event_participants_user_id_fkey (
          email,
          full_name
        )
      `
        )
        .eq('event_id', initiative.id)
        .returns<EventParticipant[]>();

      if (error) {
        console.error('Error fetching participants:', error);
        return;
      }

      if (data) {
        setInitiative((prev) => ({
          ...prev,
          participants: data,
        }));
      }
    }

    fetchParticipants();

    // Set up real-time subscription
    const channel = supabase
      .channel('event_participants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_participants',
          filter: `event_id=eq.${initiative.id}`,
        },
        fetchParticipants
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initiative.id, initiative.initiative_type, supabase]);

  const handleParticipationUpdate = async (
    newStatus: ParticipationStatus | null
  ) => {
    if (!currentUser || isUpdating) return;

    setIsUpdating(true);

    try {
      if (newStatus === null) {
        // Remove participation
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', initiative.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        // Update local state
        setInitiative((prev) => ({
          ...prev,
          participants:
            prev.participants?.filter((p) => p.user_id !== currentUser.id) ||
            [],
        }));
        setCurrentUserStatus(null);
      } else {
        // Prepare participant data
        const participantData = {
          event_id: initiative.id,
          user_id: currentUser.id,
          status: newStatus,
        };

        // Use upsert instead of insert
        const { error } = await supabase
          .from('event_participants')
          .upsert(participantData);

        if (error) throw error;

        // Update local state
        setInitiative((prev) => {
          const otherParticipants =
            prev.participants?.filter((p) => p.user_id !== currentUser.id) ||
            [];
          return {
            ...prev,
            participants: [
              ...otherParticipants,
              {
                ...participantData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user: {
                  email: currentUser.email,
                  full_name: currentUser.full_name,
                },
              } as EventParticipant,
            ],
          };
        });
        setCurrentUserStatus(newStatus);
      }
    } catch (error) {
      console.error('Error updating participation:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Group participants by status
  const participantsByStatus = initiative.participants?.reduce(
    (acc, participant) => {
      if (!acc[participant.status]) {
        acc[participant.status] = [];
      }
      acc[participant.status].push(participant);
      return acc;
    },
    {} as Record<ParticipationStatus, EventParticipant[]>
  );

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
          <h1 className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-3">
            {initiative.title}
          </h1>

          <div className="flex items-center gap-2 mb-6">
            <Badge
              className={`inline-flex px-3 py-1.5 text-sm ${
                initiative.initiative_type === 'event'
                  ? 'bg-green-100/80 text-green-800 dark:bg-green-800/40 dark:text-green-300'
                  : 'bg-blue-100/80 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300'
              }`}
            >
              {initiative.initiative_type === 'event' ? (
                <Calendar className="w-4 h-4 mr-1.5" />
              ) : (
                <LayoutPanelLeft className="w-4 h-4 mr-1.5" />
              )}
              {initiative.initiative_type === 'event' ? 'Event' : 'Project'}
            </Badge>
            <div
              className={`flex items-center px-3 py-1.5 rounded-full ${
                initiative.category === 'development_meeting'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300'
                  : initiative.category === 'social'
                  ? 'bg-pink-100 text-pink-800 dark:bg-pink-800/30 dark:text-pink-300'
                  : initiative.category === 'outreach'
                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-800/30 dark:text-cyan-300'
                  : initiative.category === 'policy'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300'
                  : initiative.category === 'training'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-300'
                  : initiative.category === 'research'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-800/30 dark:text-rose-300'
              }`}
            >
              {initiative.category === 'development_meeting' ? (
                <Users2 className="w-4 h-4 mr-1.5" />
              ) : initiative.category === 'social' ? (
                <Users className="w-4 h-4 mr-1.5" />
              ) : initiative.category === 'outreach' ? (
                <Globe2 className="w-4 h-4 mr-1.5" />
              ) : initiative.category === 'policy' ? (
                <BookOpen className="w-4 h-4 mr-1.5" />
              ) : initiative.category === 'training' ? (
                <GraduationCap className="w-4 h-4 mr-1.5" />
              ) : initiative.category === 'research' ? (
                <Code className="w-4 h-4 mr-1.5" />
              ) : (
                <Rocket className="w-4 h-4 mr-1.5" />
              )}
              <span className="text-sm capitalize">
                {initiative.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Description
          </div>
          <p className="text-base text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
            {initiative.description}
          </p>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initiative.event_date && (
            <div>
              <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Event Date
              </div>
              <div className="flex items-center text-base text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(initiative.event_date), 'EEEE, MMMM do yyyy')}
              </div>
            </div>
          )}

          {initiative.start_time && (
            <div>
              <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Start Time
              </div>
              <div className="flex items-center text-base text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(initiative.start_time)}
              </div>
            </div>
          )}

          {initiative.location && (
            <div>
              <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Location
              </div>
              <div className="flex items-center text-base text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 mr-2" />
                {initiative.location}
              </div>
            </div>
          )}
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Status
            </div>
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
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Priority
            </div>
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

        {/* Participants Section */}
        {initiative.initiative_type === 'event' &&
          initiative.open_to_everyone && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="bg-slate-50 dark:bg-slate-900/90 rounded-lg p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Participants (
                    {initiative.participants?.filter(
                      (p) => p.status !== 'not_going'
                    ).length || 0}
                    {initiative.max_participants
                      ? ` / ${initiative.max_participants}`
                      : ''}
                    )
                  </div>
                </div>

                {/* Participation Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    variant={
                      currentUserStatus === 'going' ? 'default' : 'outline'
                    }
                    onClick={() => handleParticipationUpdate('going')}
                    disabled={isUpdating}
                  >
                    Going
                  </Button>
                  <Button
                    variant={
                      currentUserStatus === 'maybe' ? 'orange' : 'outline'
                    }
                    onClick={() => handleParticipationUpdate('maybe')}
                    disabled={isUpdating}
                  >
                    Maybe
                  </Button>
                  <Button
                    variant={
                      currentUserStatus === 'not_going'
                        ? 'destructive'
                        : 'outline'
                    }
                    onClick={() => handleParticipationUpdate('not_going')}
                    disabled={isUpdating}
                  >
                    Not Going
                  </Button>
                  {currentUserStatus && (
                    <Button
                      variant="ghost"
                      onClick={() => handleParticipationUpdate(null)}
                      disabled={isUpdating}
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Participant Lists */}
                <div className="space-y-6">
                  {['going', 'maybe', 'not_going'].map((status) => {
                    const participants =
                      participantsByStatus?.[status as ParticipationStatus] ||
                      [];
                    if (participants.length === 0) return null;

                    return (
                      <div key={status}>
                        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 capitalize">
                          {status.replace('_', ' ')} ({participants.length})
                        </h4>
                        <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm divide-y divide-slate-200 dark:divide-slate-700">
                          {participants.map((participant: EventParticipant) => (
                            <div
                              key={participant.user_id}
                              className="flex items-center px-4 py-3 "
                            >
                              <div
                                className={`h-8 w-8 rounded-full ${getUserColor(
                                  participant.user_id
                                )} flex items-center justify-center`}
                              >
                                <span className="text-sm font-medium text-white">
                                  {participant.user?.full_name?.[0]?.toUpperCase() ||
                                    participant.user?.email[0]?.toUpperCase()}
                                </span>
                              </div>
                              <span className="ml-3 text-base font-medium text-slate-700 dark:text-slate-200">
                                {participant.user?.full_name ||
                                  participant.user?.email}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        {/* Created By and Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Created By
            </div>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {initiative.created_by_user.full_name ||
                initiative.created_by_user.email}
            </p>
          </div>

          <div>
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Created
            </div>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {format(new Date(initiative.created_at), 'PPp')}
            </p>
          </div>

          <div>
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Last Updated
            </div>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {format(new Date(initiative.updated_at), 'PPp')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
