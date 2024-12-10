// app/(default)/doodle-polls/create-event-button.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  DoodlePoll,
  DoodlePollOption,
  DoodlePollParticipant,
  participationMapping,
} from '@/types/doodle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CalendarClock, CheckCircle2, CircleSlash, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateEventButtonProps {
  poll: DoodlePoll;
  options: DoodlePollOption[];
  participants: DoodlePollParticipant[];
  onEventCreated?: () => void;
}

interface OptionScore {
  option: DoodlePollOption;
  score: number;
  yesCount: number;
  maybeCount: number;
  noCount: number;
}

const getEventTable = (eventType: DoodlePoll['event_type']): string => {
  if (eventType === 'social_event') return 'social_events';
  if (eventType === 'development_event') return 'development_initiatives';
  return 'calendar_events';
};

export default function CreateEventButton({
  poll,
  options,
  participants,
  onEventCreated,
}: CreateEventButtonProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const getOptionScore = (optionId: string): OptionScore => {
    let yesCount = 0;
    let maybeCount = 0;
    let noCount = 0;

    participants.forEach((participant) => {
      const response = participant.responses[optionId];
      if (response === 'yes') yesCount++;
      else if (response === 'maybe') maybeCount++;
      else if (response === 'no') noCount++;
    });

    const option = options.find((o) => o.id === optionId)!;
    return {
      option,
      score: yesCount * 2 + maybeCount,
      yesCount,
      maybeCount,
      noCount,
    };
  };

  const getBestOption = (): OptionScore => {
    return options
      .map((option) => getOptionScore(option.id))
      .reduce((best, current) => (current.score > best.score ? current : best));
  };

  const formatOptionLabel = (score: OptionScore) => {
    const date = format(new Date(score.option.date), 'EEE, MMM d');
    const time = score.option.start_time
      ? format(new Date(`2000-01-01T${score.option.start_time}`), 'h:mm a')
      : '';
    const duration = score.option.duration
      ? `(${score.option.duration} hours)`
      : '';

    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <span>{`${date} at ${time} ${duration}`}</span>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
              {score.yesCount}
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-yellow-500 mr-1" />
              {score.maybeCount}
            </div>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {score.score} points
        </div>
      </div>
    );
  };

  const handleCreateEvent = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const selectedTimeSlot = options.find((o) => o.id === selectedOption);
      if (!selectedTimeSlot) throw new Error('No time slot selected');

      const mapping = participationMapping[poll.event_type];
      if (!mapping) throw new Error('Invalid event type');

      // Determine the event table based on event type
      let eventTable: string;
      let eventData: any;

      const eventDateTime = new Date(selectedTimeSlot.date);
      if (selectedTimeSlot.start_time) {
        const [hour, minute] = selectedTimeSlot.start_time.split(':');
        eventDateTime.setHours(parseInt(hour, 10));
        eventDateTime.setMinutes(parseInt(minute, 10));
      }

      const durationInHours = selectedTimeSlot.duration
        ? parseFloat(selectedTimeSlot.duration)
        : null;

      const endDateTime = new Date(eventDateTime);
      if (durationInHours) {
        endDateTime.setHours(
          endDateTime.getHours() + Math.floor(durationInHours)
        );
        endDateTime.setMinutes(
          endDateTime.getMinutes() + (durationInHours % 1) * 60
        );
      }

      let createdEventId: string;

      if (poll.event_type === 'social_event') {
        eventTable = 'social_events';
        eventData = {
          title: poll.title,
          description: poll.description,
          category: poll.category,
          location: poll.location,
          created_by: user.id,
          event_date: eventDateTime.toISOString(),
          start_time: selectedTimeSlot.start_time || null,
          duration: durationInHours ? `${durationInHours} hours` : null,
          status: 'upcoming',
          open_to_everyone: true,
        };
      } else if (poll.event_type === 'development_event') {
        eventTable = 'development_initiatives';
        eventData = {
          title: poll.title,
          description: poll.description,
          category: poll.category || 'general',
          location: poll.location,
          created_by: user.id,
          event_date: eventDateTime.toISOString(),
          start_time: selectedTimeSlot.start_time || null,
          duration: durationInHours ? `${durationInHours} hours` : null,
          status: 'active',
          initiative_type: 'event',
          priority: 'medium',
          open_to_everyone: true,
        };

        // Create the development initiative first
        const { data: event, error: eventError } = await supabase
          .from(eventTable)
          .insert(eventData)
          .select()
          .single();

        if (eventError) {
          console.error('Event creation error:', eventError);
          throw new Error(`Failed to create event: ${eventError.message}`);
        }

        createdEventId = event.id;

        // Now create the participants
        const participantsToCreate = participants.map((p) => ({
          event_id: createdEventId,
          user_id: p.user_id,
          status: mapping.statusValues[p.responses[selectedOption] || 'no'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        if (participantsToCreate.length > 0) {
          const { error: participantsError } = await supabase
            .from('event_participants')
            .insert(participantsToCreate);

          if (participantsError) {
            console.error('Participant creation error:', participantsError);
            throw new Error('Failed to create event participants');
          }
        }

        // Create calendar event entry
        const calendarEventData = {
          title: poll.title,
          description: poll.description,
          start_time: eventDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          event_type: poll.event_type,
          category: poll.category,
          created_by: user.id,
          reference_id: createdEventId,
          updated_at: new Date().toISOString(),
        };

        const { error: calendarError } = await supabase
          .from('calendar_events')
          .insert(calendarEventData);

        if (calendarError) {
          console.error('Calendar event creation error:', calendarError);
          throw new Error('Failed to create calendar event');
        }
      } else {
        // Handle all other calendar event types
        eventTable = 'calendar_events';
        eventData = {
          title: poll.title,
          description: poll.description,
          start_time: eventDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          event_type: poll.event_type,
          category: poll.event_type,
          created_by: user.id,
          reference_id: poll.id,
          updated_at: new Date().toISOString(),
        };
      }

      // Create the event
      const { data: event, error: eventError } = await supabase
        .from(eventTable)
        .insert(eventData)
        .select()
        .single();

      if (eventError) {
        console.error('Event creation error:', eventError);
        throw new Error(`Failed to create event: ${eventError.message}`);
      }

      createdEventId = event.id;

      // Create participants based on poll responses
      if (poll.event_type === 'social_event') {
        const participantsToCreate = participants.map((p) => ({
          event_id: createdEventId,
          user_id: p.user_id,
          status: mapping.statusValues[p.responses[selectedOption] || 'no'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        if (participantsToCreate.length > 0) {
          const { error: participantsError } = await supabase
            .from('social_event_participants')
            .insert(participantsToCreate);
          if (participantsError) {
            console.error('Participant creation error:', participantsError);
            throw new Error('Failed to create event participants');
          }
        }
      } else if (poll.event_type === 'development_event') {
        const participantsToCreate = participants.map((p) => ({
          event_id: createdEventId,
          user_id: p.user_id,
          status: mapping.statusValues[p.responses[selectedOption] || 'no'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        if (participantsToCreate.length > 0) {
          const { error: participantsError } = await supabase
            .from('event_participants')
            .insert(participantsToCreate)
            .select();
          if (participantsError) {
            console.error('Participant creation error:', participantsError);
            throw new Error('Failed to create event participants');
          }
        }
      }

      // Update the poll status
      const pollUpdateData: {
        closed: boolean;
        updated_at: string;
        event_id?: string | null;
      } = {
        closed: true,
        updated_at: new Date().toISOString(),
      };

      if (poll.event_type === 'social_event') {
        pollUpdateData.event_id = createdEventId;
      }

      const { error: pollError } = await supabase
        .from('doodle_polls')
        .update(pollUpdateData)
        .eq('id', poll.id);

      if (pollError) {
        console.error('Poll update error:', pollError);
        throw new Error('Failed to update poll status');
      }

      setIsOpen(false);
      setIsAlertOpen(false);
      onEventCreated?.();
      router.refresh();
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while creating the event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get best option and scores for all options
  const bestOption = getBestOption();
  const optionScores = options.map((option) => getOptionScore(option.id));

  // Auto-select the best option initially
  if (bestOption && !selectedOption) {
    setSelectedOption(bestOption.option.id);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className="w-full sm:w-auto">
            <CalendarClock className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </DialogTrigger>

        <DialogContent className="w-full max-w-lg bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">
              Create Event from Poll
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-base text-slate-900 dark:text-slate-300">
                Select Time Slot
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Choose when to schedule the event
              </p>

              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                className="space-y-3"
              >
                {optionScores.map((score) => (
                  <div
                    key={score.option.id}
                    className={cn(
                      'flex items-center space-x-3 p-4 rounded-lg border',
                      score.option.id === bestOption.option.id
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700'
                    )}
                  >
                    <RadioGroupItem
                      value={score.option.id}
                      id={score.option.id}
                    />
                    <Label
                      htmlFor={score.option.id}
                      className="flex-1 cursor-pointer text-slate-900 dark:text-slate-100"
                    >
                      {formatOptionLabel(score)}
                    </Label>
                    {score.option.id === bestOption.option.id && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!selectedOption || isSubmitting}
                onClick={() => setIsAlertOpen(true)}
                className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Event</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the poll and add the event to the calendar. Do you
              wish to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateEvent}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Yes, create event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
