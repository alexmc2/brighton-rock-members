'use client';

import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Calendar,
  Clock,
  Users,
  MapPin
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  SocialEventWithDetails,
  SocialEventParticipant,
  ParticipationStatus
} from '@/types/social';
import { getUserColor } from '@/lib/utils';

interface SocialEventDetailsProps {
  event: SocialEventWithDetails;
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function SocialEventDetails({ event: initialEvent }: SocialEventDetailsProps) {
  const supabase = createClientComponentClient();
  const [event, setEvent] = useState(initialEvent);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    full_name: string | null;
  } | null>(null);
  const [currentUserStatus, setCurrentUserStatus] = useState<ParticipationStatus | null>(null);

  // Fetch current user and their participation status
  useEffect(() => {
    async function fetchUserAndStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
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
            .from('social_event_participants')
            .select('status')
            .eq('event_id', event.id)
            .eq('user_id', user.id)
            .single();

          if (participation) {
            setCurrentUserStatus(participation.status as ParticipationStatus);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUserAndStatus();
  }, [event.id, supabase]);

  // Set up real-time subscription for participant updates
  useEffect(() => {
    const channel = supabase
      .channel('social_event_participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_event_participants',
          filter: `event_id=eq.${event.id}`,
        },
        async () => {
          // Fetch updated participants
          const { data: participants } = await supabase
            .from('social_event_participants')
            .select(`
              *,
              user:profiles!social_event_participants_user_id_fkey(
                email,
                full_name
              )
            `)
            .eq('event_id', event.id);

          if (participants) {
            setEvent(prev => ({
              ...prev,
              participants: participants as SocialEventParticipant[]
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id, supabase]);

  const handleParticipationUpdate = async (newStatus: ParticipationStatus | null) => {
    if (!currentUser || isUpdating) return;

    setIsUpdating(true);

    try {
      if (newStatus === null) {
        // Remove participation
        const { error } = await supabase
          .from('social_event_participants')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setCurrentUserStatus(null);
      } else {
        // Upsert participant data
        const participantData = {
          event_id: event.id,
          user_id: currentUser.id,
          status: newStatus,
        };

        const { error } = await supabase
          .from('social_event_participants')
          .upsert(participantData);

        if (error) throw error;

        setCurrentUserStatus(newStatus);
      }
    } catch (error) {
      console.error('Error updating participation:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Group participants by status
  const participantsByStatus = event.participants?.reduce(
    (acc, participant) => {
      if (!acc[participant.status]) {
        acc[participant.status] = [];
      }
      acc[participant.status].push(participant);
      return acc;
    },
    {} as Record<ParticipationStatus, SocialEventParticipant[]>
  );

  // Calculate active participant count (excluding not_going)
  const activeParticipantCount = event.participants?.filter(
    p => p.status !== 'not_going'
  ).length || 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Description
          </h3>
          <p className="text-base text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">
            {event.description}
          </p>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {event.event_date && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Event Date
              </h3>
              <div className="flex items-center text-base text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(event.event_date), 'EEEE, MMMM do yyyy')}
              </div>
            </div>
          )}

          {event.start_time && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Start Time
              </h3>
              <div className="flex items-center text-base text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(event.start_time)}
              </div>
            </div>
          )}

          {event.location && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Location
              </h3>
              <div className="flex items-center text-base text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 mr-2" />
                {event.location}
              </div>
            </div>
          )}

          {event.open_to_everyone && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Participants
              </h3>
              <div className="flex items-center text-base text-slate-600 dark:text-slate-300">
                <Users className="w-4 h-4 mr-2" />
                {activeParticipantCount} / 12 participants
              </div>
            </div>
          )}
        </div>

        {/* Participants Section */}
        {event.open_to_everyone && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              {/* Participation Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Button
                  variant={currentUserStatus === 'going' ? 'default' : 'outline'}
                  onClick={() => handleParticipationUpdate('going')}
                  disabled={isUpdating}
                >
                  Going
                </Button>
                <Button
                  variant={currentUserStatus === 'maybe' ? 'orange' : 'outline'}
                  onClick={() => handleParticipationUpdate('maybe')}
                  disabled={isUpdating}
                >
                  Maybe
                </Button>
                <Button
                  variant={currentUserStatus === 'not_going' ? 'destructive' : 'outline'}
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
                {(['going', 'maybe', 'not_going'] as const).map((status) => {
                  const participants = participantsByStatus?.[status as ParticipationStatus] || [];
                  if (participants.length === 0) return null;

                  return (
                    <div key={status}>
                      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 capitalize">
                        {status.replace('_', ' ')} ({participants.length})
                      </h4>
                      <div className="bg-white dark:bg-slate-900 rounded-md shadow-sm divide-y divide-slate-200 dark:divide-slate-700">
                        {participants.map((participant) => (
                          <div
                            key={participant.user_id}
                            className="flex items-center px-4 py-3"
                          >
                            <div 
                              className={`h-8 w-8 rounded-full ${getUserColor(participant.user_id)} flex items-center justify-center`}
                            >
                              <span className="text-sm font-medium text-white">
                                {participant.user?.full_name?.[0]?.toUpperCase() ||
                                  participant.user?.email[0]?.toUpperCase()}
                              </span>
                            </div>
                            <span className="ml-3 text-base font-medium text-slate-700 dark:text-slate-200">
                              {participant.user?.full_name || participant.user?.email}
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
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Created By
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {event.created_by_user?.full_name || event.created_by_user?.email}
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Created
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {format(new Date(event.created_at), 'PPp')}
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Last Updated
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {format(new Date(event.updated_at), 'PPp')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}