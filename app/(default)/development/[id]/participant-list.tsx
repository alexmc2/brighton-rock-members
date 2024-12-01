// app/(default)/development/[id]/participant-list.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DevelopmentInitiativeWithDetails,
  ParticipationStatus,
} from '@/types/development';
import { Users } from 'lucide-react';

interface ParticipantListProps {
  initiative: DevelopmentInitiativeWithDetails;
  maxParticipants: number | null;
}

export default function ParticipantList({
  initiative,
  maxParticipants,
}: ParticipantListProps) {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (!authError && user) {
        setCurrentUserId(user.id);
      }
    }
    getCurrentUser();
  }, [supabase]);

  const currentUserParticipation = initiative.participants?.find(
    (p) => p.user_id === currentUserId
  );

  const handleParticipationUpdate = async (status: ParticipationStatus) => {
    if (!currentUserId || isUpdating) return;
    setIsUpdating(true);

    try {
      if (currentUserParticipation) {
        // Update existing participation
        const { error } = await supabase
          .from('event_participants')
          .update({ status })
          .eq('event_id', initiative.id)
          .eq('user_id', currentUserId);

        if (error) throw error;
      } else {
        // Create new participation
        const { error } = await supabase.from('event_participants').insert({
          event_id: initiative.id,
          user_id: currentUserId,
          status,
        });

        if (error) throw error;
      }

      router.refresh();
    } catch (err) {
      console.error('Error updating participation:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const participantsByStatus = {
    going: initiative.participants?.filter((p) => p.status === 'going') || [],
    maybe: initiative.participants?.filter((p) => p.status === 'maybe') || [],
    not_going:
      initiative.participants?.filter((p) => p.status === 'not_going') || [],
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Participants</h3>
          <div className="text-sm text-slate-500">
            {participantsByStatus.going.length}
            {maxParticipants && ` / ${maxParticipants}`} going
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* RSVP Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleParticipationUpdate('going')}
              variant={
                currentUserParticipation?.status === 'going'
                  ? 'default'
                  : 'outline'
              }
              disabled={isUpdating}
            >
              Going
            </Button>
            <Button
              onClick={() => handleParticipationUpdate('maybe')}
              variant={
                currentUserParticipation?.status === 'maybe'
                  ? 'default'
                  : 'outline'
              }
              disabled={isUpdating}
            >
              Maybe
            </Button>
            <Button
              onClick={() => handleParticipationUpdate('not_going')}
              variant={
                currentUserParticipation?.status === 'not_going'
                  ? 'default'
                  : 'outline'
              }
              disabled={isUpdating}
            >
              Not Going
            </Button>
          </div>

          {/* Participant Lists */}
          {['going', 'maybe', 'not_going'].map((status) => (
            <div key={status}>
              <h4 className="font-medium text-sm text-slate-500 mb-2 capitalize">
                {status.replace('_', ' ')} (
                {participantsByStatus[status as ParticipationStatus].length})
              </h4>
              <div className="space-y-2">
                {participantsByStatus[status as ParticipationStatus].map(
                  (participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center text-sm text-slate-600 dark:text-slate-300"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {participant.user?.full_name || participant.user?.email}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
