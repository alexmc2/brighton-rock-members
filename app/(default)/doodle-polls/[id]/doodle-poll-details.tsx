'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, CircleSlash, Minus } from 'lucide-react';
import { cn, getUserColor } from '@/lib/utils';
import { format } from 'date-fns';
import type { DoodlePollResponse, DoodlePollWithDetails } from '@/types/doodle';
import { eventTypeToCalendarCategory } from '@/types/doodle';
import CreateEventButton from '../create-event-button';

interface DoodlePollDetailsProps {
  poll: DoodlePollWithDetails;
  currentUserId?: string;
  currentUserName?: string;
}

export default function DoodlePollDetails({
  poll,
  currentUserId,
  currentUserName,
}: DoodlePollDetailsProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Format poll options for display
  const timeSlots = poll.options.map((option) => ({
    ...option,
    day: format(new Date(option.date), 'EEE').toUpperCase(),
    dayOfMonth: parseInt(format(new Date(option.date), 'd')),
    month: format(new Date(option.date), 'MMM'),
    times: option.start_time
      ? ([
          format(new Date(`2000-01-01T${option.start_time}`), 'HH:mm'),
          option.duration ? `${option.duration}h` : null,
        ].filter(Boolean) as string[])
      : [],
  }));

  // Find current user's responses if they exist
  const currentUserParticipant = poll.participants.find(
    (p) => p.user_id === currentUserId
  );

  // Initialize userResponses with current user's responses or empty object
  const [userResponses, setUserResponses] = useState<
    Record<string, DoodlePollResponse>
  >(currentUserParticipant?.responses || {});

  const toggleResponse = async (optionId: string) => {
    if (poll.closed || !currentUserId) return;

    const newResponses = { ...userResponses };
    const current = newResponses[optionId];

    if (!current) {
      newResponses[optionId] = 'yes';
    } else if (current === 'yes') {
      newResponses[optionId] = 'maybe';
    } else if (current === 'maybe') {
      newResponses[optionId] = 'no';
    } else if (current === 'no') {
      delete newResponses[optionId]; // Remove the response to go back to no response
    }

    try {
      if (currentUserParticipant) {
        // Update existing participant
        await supabase
          .from('doodle_poll_participants')
          .update({
            responses: newResponses,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUserParticipant.id);
      } else {
        // Create new participant
        await supabase.from('doodle_poll_participants').insert({
          poll_id: poll.id,
          user_id: currentUserId,
          responses: newResponses,
        });
      }

      // Update local state
      setUserResponses(newResponses);

      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error('Error updating response:', error);
    }
  };

  // Calculate participants count including those with no responses
  const participantsCount = new Set(
    poll.participants
      .filter((p) =>
        Object.values(p.responses).some(
          (r) => r === 'yes' || r === 'maybe' || r === 'no'
        )
      )
      .map((p) => p.user_id)
  ).size;

  // Get available count for an option
  const getAvailableCount = (optionId: string) => {
    return poll.participants.filter((p) => p.responses[optionId] === 'yes')
      .length;
  };

  // Get counts for an option
  const getCounts = (optionId: string) => {
    const yesCount = poll.participants.filter(
      (p) => p.responses[optionId] === 'yes'
    ).length;
    const maybeCount = poll.participants.filter(
      (p) => p.responses[optionId] === 'maybe'
    ).length;
    const noCount = poll.participants.filter(
      (p) => p.responses[optionId] === 'no'
    ).length;
    return { yesCount, maybeCount, noCount };
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-none">
        {/* Event Details Header */}
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {poll.title}
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <p>
              <span className="font-medium">Type:</span>{' '}
              {eventTypeToCalendarCategory(poll.event_type)}
            </p>
            <p>
              <span className="font-medium">Created by:</span>{' '}
              {poll.created_by_user.full_name || poll.created_by_user.email}
            </p>
            {poll.description && (
              <p>
                <span className="font-medium">Description:</span>{' '}
                {poll.description}
              </p>
            )}
            {poll.response_deadline && (
              <p>
                <span className="font-medium">Response Deadline:</span>{' '}
                {format(new Date(poll.response_deadline), 'PPP p')}
              </p>
            )}
          </div>
        </div>

        {/* Response Legend */}
        <div className="mb-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-slate-600 dark:text-slate-400">Yes</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-600 dark:text-yellow-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="text-slate-600 dark:text-slate-400">
              If need be
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CircleSlash className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-slate-600 dark:text-slate-400">No</span>
          </div>
          <div className="flex items-center gap-1">
            <CircleSlash className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            <span className="text-slate-600 dark:text-slate-400">Pending</span>
          </div>
        </div>

        <div className="border rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/80 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="">
              {/* Header */}
              <div className="grid grid-cols-[180px_repeat(50,150px)] border-b border-slate-200 dark:border-slate-600">
                <div className="p-4" />
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 text-center border-l border-r border-slate-200 dark:border-slate-600"
                  >
                    <div className="text-slate-600 dark:text-slate-400">
                      {slot.month}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {slot.dayOfMonth}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {slot.day}
                    </div>
                    {slot.times.map((time) => (
                      <div
                        key={time}
                        className="text-sm text-slate-600 dark:text-slate-400 mt-1"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Participants count */}
              <div className="grid grid-cols-[180px_repeat(50,150px)] border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                <div className="p-4 text-slate-600 dark:text-slate-400">
                  {participantsCount === 0
                    ? 'No responses yet'
                    : `${participantsCount} ${
                        participantsCount === 1 ? 'response' : 'responses'
                      }`}
                </div>
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 text-center border-r border-l border-slate-200 dark:border-slate-600"
                  >
                    <div className="text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {getAvailableCount(slot.id)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current user response section */}
              {!poll.closed && currentUserId && (
                <div className="grid grid-cols-[180px_repeat(50,150px)] border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                  <div className="p-4 flex items-center text-slate-600 dark:text-slate-400">
                    My Response:
                    {/* <span className="ml-2 font-medium text-slate-900 dark:text-white">
                      {currentUserParticipant?.user?.full_name ||
                        currentUserName ||
                        'User'}
                    </span> */}
                  </div>
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant="ghost"
                      className={cn(
                        'h-full rounded-none border border-slate-200 dark:border-slate-600'
                        // userResponses[slot.id] === 'yes' &&
                        //   'bg-green-200/70 dark:bg-green-600/30',
                        // userResponses[slot.id] === 'maybe' &&
                        //   'bg-yellow-200/70 dark:bg-yellow-600/30',
                        // userResponses[slot.id] === 'no' &&
                        //   'bg-red-200/70 dark:bg-red-900/30'
                      )}
                      onClick={() => toggleResponse(slot.id)}
                    >
                      {userResponses[slot.id] === 'yes' && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      {userResponses[slot.id] === 'maybe' && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-yellow-600 dark:text-yellow-400"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      )}
                      {userResponses[slot.id] === 'no' && (
                        <CircleSlash className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      {!userResponses[slot.id] && (
                        <CircleSlash className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </Button>
                  ))}
                </div>
              )}

              {/* Existing participants */}
              {poll.participants
                .filter((participant) =>
                  Object.values(participant.responses).some(
                    (r) => r === 'yes' || r === 'maybe' || r === 'no'
                  )
                )
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="grid grid-cols-[180px_repeat(50,150px)] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                  >
                    <div className="p-4 flex items-center gap-2">
                      <Avatar
                        className={cn(
                          'w-6 h-6 flex items-center justify-center',
                          getUserColor(participant.user_id)
                        )}
                      >
                        <div className="text-white text-xs">
                          {participant.user.full_name?.[0]?.toUpperCase() ||
                            participant.user.email[0].toUpperCase()}
                        </div>
                      </Avatar>
                      <span className="text-slate-900 dark:text-white">
                        {participant.user.full_name || participant.user.email}
                      </span>
                    </div>
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={cn(
                          'border-l border-r border-slate-200 dark:border-slate-600 p-4 flex items-center justify-center',
                          participant.responses[slot.id] === 'yes' &&
                            'bg-green-200/70 dark:bg-green-600/30',
                          participant.responses[slot.id] === 'maybe' &&
                            'bg-yellow-200/70 dark:bg-yellow-600/30',
                          participant.responses[slot.id] === 'no' &&
                            'bg-red-200/70 dark:bg-red-900/30'
                        )}
                      >
                        {participant.responses[slot.id] === 'yes' && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                        {participant.responses[slot.id] === 'maybe' && (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-yellow-600 dark:text-yellow-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                        )}
                        {participant.responses[slot.id] === 'no' && (
                          <CircleSlash className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Create Event Button */}
        {!poll.closed && (
          <div className="mt-6">
            <CreateEventButton
              poll={poll}
              options={poll.options}
              participants={poll.participants}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
