// app/(default)/development/[id]/participant-list.tsx

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  EventParticipant,
  ParticipationStatus,
  DevelopmentInitiativeWithDetails,
} from '@/types/development';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ParticipantListProps {
  initiativeId: string;
}

export default function ParticipantList({
  initiativeId,
}: ParticipantListProps) {
  const supabase = createClientComponentClient();
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    full_name: string | null;
  } | null>(null);
  const [currentUserStatus, setCurrentUserStatus] =
    useState<ParticipationStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch participants and current user
  useEffect(() => {
    async function fetchParticipants() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata.full_name || null,
        });
      }

      const { data, error } = await supabase
        .from('event_participants')
        .select(
          `
          *,
          user:profiles (
            email,
            full_name
          )
        `
        )
        .eq('event_id', initiativeId);

      if (error) {
        console.error('Error fetching participants:', error);
        return;
      }

      setParticipants(data as EventParticipant[]);

      if (user) {
        const currentUserParticipation = data.find(
          (p) => p.user_id === user.id
        );
        if (currentUserParticipation) {
          setCurrentUserStatus(currentUserParticipation.status);
        }
      }
    }

    fetchParticipants();
  }, [initiativeId, supabase]);

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
          .eq('event_id', initiativeId)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setParticipants((prev) =>
          prev.filter((p) => p.user_id !== currentUser.id)
        );
        setCurrentUserStatus(null);
      } else {
        const participantData = {
          event_id: initiativeId,
          user_id: currentUser.id,
          status: newStatus,
        };

        const { error } = await supabase
          .from('event_participants')
          .upsert(participantData);

        if (error) throw error;

        setParticipants((prev) => [
          ...prev.filter((p) => p.user_id !== currentUser.id),
          {
            ...participantData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              email: currentUser.email,
              full_name: currentUser.full_name,
            },
          },
        ]);
        setCurrentUserStatus(newStatus);
      }
    } catch (error) {
      console.error('Error updating participation:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Group participants by status
  const participantsByStatus = participants.reduce((acc, participant) => {
    if (!acc[participant.status]) {
      acc[participant.status] = [];
    }
    acc[participant.status].push(participant);
    return acc;
  }, {} as Record<ParticipationStatus, EventParticipant[]>);

  return (
    <div>
      {/* Participation Buttons */}
      <div className="flex items-center space-x-6 mb-6">
        <Button
          variant={currentUserStatus === 'going' ? 'default' : 'outline'}
          onClick={() => handleParticipationUpdate('going')}
          disabled={isUpdating}
        >
          Going
        </Button>
        <Button
          variant={currentUserStatus === 'maybe' ? 'default' : 'outline'}
          onClick={() => handleParticipationUpdate('maybe')}
          disabled={isUpdating}
        >
          Maybe
        </Button>
        <Button
          variant={currentUserStatus === 'not_going' ? 'default' : 'outline'}
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

      {/* Attendance Lists */}
      <div className="space-y-6">
        {['going', 'maybe', 'not_going'].map((status) => {
          const participantsInStatus =
            participantsByStatus[status as ParticipationStatus];
          if (!participantsInStatus || participantsInStatus.length === 0) {
            return null;
          }
          return (
            <div key={status}>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 capitalize">
                {status.replace('_', ' ')} ({participantsInStatus.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {participantsInStatus.map((participant) => (
                  <div key={participant.user_id} className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {participant.user?.full_name?.[0] ||
                          participant.user?.email[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm ml-2">
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
  );
}
