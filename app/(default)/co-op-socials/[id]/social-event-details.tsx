'use client';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Calendar, Clock, Users, MapPin, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  SocialEventWithDetails,
  SocialEventParticipant,
  ParticipationStatus,
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

const formatDuration = (duration: string) => {
  const hours = parseInt(duration.split(' ')[0]);
  return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
};

export default function SocialEventDetails({
  event: initialEvent,
}: SocialEventDetailsProps) {
  const supabase = createClientComponentClient();
  const [event, setEvent] = useState(initialEvent);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    full_name: string | null;
  } | null>(null);
  const [currentUserStatus, setCurrentUserStatus] =
    useState<ParticipationStatus | null>(null);

  // Fetch current user and their participation status once on mount
  useEffect(() => {
    async function fetchUserAndStatus() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCurrentUser(profile);

          // Get user's participation status for this event
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

  // Handle participation updates with optimistic UI updates
  const handleParticipationUpdate = async (
    newStatus: ParticipationStatus | null
  ) => {
    if (!currentUser || isUpdating) return;

    setIsUpdating(true);

    // Optimistically update the UI
    const previousStatus = currentUserStatus;
    setCurrentUserStatus(newStatus);

    // Update the participants list optimistically
    const updatedParticipants = [...(event.participants || [])];
    const userIndex = updatedParticipants.findIndex(
      (p) => p.user_id === currentUser.id
    );

    if (newStatus === null) {
      // Remove participation
      if (userIndex > -1) {
        updatedParticipants.splice(userIndex, 1);
      }
    } else {
      // Add or update participation
      const updatedParticipant: SocialEventParticipant = {
        event_id: event.id,
        user_id: currentUser.id,
        status: newStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: currentUser,
      };

      if (userIndex > -1) {
        updatedParticipants[userIndex] = updatedParticipant;
      } else {
        updatedParticipants.push(updatedParticipant);
      }
    }

    setEvent((prev) => ({
      ...prev,
      participants: updatedParticipants,
    }));

    try {
      if (newStatus === null) {
        // Remove participation
        await supabase
          .from('social_event_participants')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', currentUser.id);
      } else {
        // Add or update participation
        await supabase.from('social_event_participants').upsert({
          event_id: event.id,
          user_id: currentUser.id,
          status: newStatus,
        });
      }
    } catch (error) {
      console.error('Error updating participation:', error);
      // Revert optimistic updates on error
      setCurrentUserStatus(previousStatus);
      setEvent((prev) => ({
        ...prev,
        participants: event.participants,
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  // Group participants by status
  const participantsByStatus = event.participants?.reduce(
    (acc, participant) => {
      const status = participant.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(participant);
      return acc;
    },
    {
      going: [] as SocialEventParticipant[],
      maybe: [] as SocialEventParticipant[],
      not_going: [] as SocialEventParticipant[],
    }
  ) || { going: [], maybe: [], not_going: [] };

  const activeParticipantCount =
    event.participants?.filter((p) => p.status !== 'not_going').length || 0;

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

          {event.duration && (
            <div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Duration
              </h3>
              <div className="flex items-center text-base text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 mr-2" />
                {formatDuration(event.duration)}
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
                {activeParticipantCount} participants
              </div>
            </div>
          )}
        </div>

        {/* Participants Section */}
        {event.open_to_everyone && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="bg-slate-50 dark:bg-slate-900/90 rounded-lg p-4">
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
                  variant={currentUserStatus === 'maybe' ? 'orange' : 'outline'}
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
                {(['going', 'maybe', 'not_going'] as const).map((status) => {
                  const participants = participantsByStatus[status];
                  if (!participants?.length) return null;

                  return (
                    <div key={status}>
                      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 capitalize">
                        {status.replace('_', ' ')} ({participants.length})
                      </h4>
                      <div className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {participants.map((participant) => (
                          <div
                            key={participant.user_id}
                            className="flex items-center px-4 py-3"
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
              {event.created_by_user.full_name || event.created_by_user.email}
            </p>
          </div>

          <div>
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Created
            </div>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {format(new Date(event.created_at), 'PPp')}
            </p>
          </div>

          <div>
            <div className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Last Updated
            </div>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {format(new Date(event.updated_at), 'PPp')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
