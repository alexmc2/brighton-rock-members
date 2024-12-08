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
  const tables = {
    social_event: 'social_events',
    garden_task: 'garden_tasks',
    development_event: 'development_initiatives',
  } as const;
  return tables[eventType];
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
              <Minus className="w-4 h-4 text-yellow-500 mr-1" />
              {score.maybeCount}
            </div>
            <div className="flex items-center">
              <CircleSlash className="w-4 h-4 text-slate-400 mr-1" />
              {score.noCount}
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

      // Create the event in the appropriate table
      const eventTable = getEventTable(poll.event_type);

      const eventDateTime = new Date(selectedTimeSlot.date);
      let startTimeDate: Date | null = null;
      if (selectedTimeSlot.start_time) {
        const [hour, minute] = selectedTimeSlot.start_time.split(':');
        eventDateTime.setHours(parseInt(hour, 10));
        eventDateTime.setMinutes(parseInt(minute, 10));
        startTimeDate = new Date(eventDateTime);
      }

      const durationInHours = selectedTimeSlot.duration
        ? parseFloat(selectedTimeSlot.duration)
        : null;

      const eventData = {
        title: poll.title,
        description: poll.description,
        category: poll.category,
        location: poll.location,
        created_by: user.id,
        event_date: eventDateTime.toISOString(),
        start_time: selectedTimeSlot.start_time || null,
        duration: durationInHours ? `${durationInHours} hours` : null,
        ...(poll.event_type === 'social_event'
          ? { open_to_everyone: true }
          : {}),
        ...(poll.event_type === 'garden_task' ? { status: 'pending' } : {}),
        ...(poll.event_type === 'development_event'
          ? { status: 'active' }
          : {}),
      };

      const { data: event, error: eventError } = await supabase
        .from(eventTable)
        .insert(eventData)
        .select()
        .single();

      if (eventError) throw eventError;

      // Create participants based on poll responses
      const participantsToCreate = participants.map((p) => ({
        event_id: event.id,
        user_id: p.user_id,
        [mapping.statusField]:
          mapping.statusValues[p.responses[selectedOption] || 'no'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      if (participantsToCreate.length > 0) {
        const { error: participantsError } = await supabase
          .from(mapping.table)
          .insert(participantsToCreate);
        if (participantsError) throw participantsError;
      }

      // Update the poll with event reference and close it
      // Note: If your event_id foreign key expects only one type of event (like social_events),
      // you'll need to relax this constraint or handle referencing differently.
      const { error: pollError } = await supabase
        .from('doodle_polls')
        .update({
          event_id: poll.event_type === 'social_event' ? event.id : null,
          closed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', poll.id);

      if (pollError) throw pollError;

      setIsOpen(false);
      onEventCreated?.();
      router.refresh();
    } catch (error) {
      console.error('Error creating event:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create event'
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="w-full sm:w-auto">
          <CalendarClock className="w-4 h-4 mr-2" />
          Create{' '}
          {poll.event_type === 'social_event'
            ? 'Event'
            : poll.event_type === 'garden_task'
            ? 'Job'
            : 'Event'}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-lg bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Create{' '}
            {poll.event_type === 'social_event'
              ? 'Social Event'
              : poll.event_type === 'garden_task'
              ? 'Garden Job'
              : 'Development Event'}
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
              Choose when to schedule the{' '}
              {poll.event_type === 'social_event'
                ? 'event'
                : poll.event_type === 'garden_task'
                ? 'job'
                : 'event'}
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

          <div className="flex justify-end space-x-3 py-4">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleCreateEvent}
              disabled={isSubmitting || !selectedOption}
              className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
