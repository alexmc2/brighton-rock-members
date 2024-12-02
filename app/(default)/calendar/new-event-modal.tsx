// app/(default)/calendar/new-event-modal.tsx

'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function NewEventModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formStartTime = new Date(`${date}T${startTime}:00`);

      let endTime: Date;
      if (duration === 'All day') {
        // Set end time to the end of the day
        endTime = new Date(`${date}T23:59:59`);
      } else {
        // Add duration hours to start time
        if (duration === '0.5') {
          endTime = new Date(formStartTime.getTime() + 30 * 60 * 1000);
        } else {
          const durationHours = parseFloat(duration);
          endTime = new Date(
            formStartTime.getTime() + durationHours * 60 * 60 * 1000
          );
        }
      }

      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert({
          title,
          description,
          start_time: formStartTime.toISOString(),
          end_time: endTime.toISOString(),
          event_type: 'manual',
          category,
        });

      if (insertError) throw insertError;

      setIsOpen(false);
      router.refresh();
      // Reset form fields
      setTitle('');
      setDescription('');
      setDate('');
      setStartTime('');
      setDuration('');
      setCategory('');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Event</Button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          {/* Background overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          {/* Dialog content */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white dark:bg-slate-800 p-6 shadow-xl border border-green-500">
                  <Dialog.Title className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    Add New Event
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    {/* Title Field */}
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        required
                        placeholder="Event title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-md px-3 py-2"
                      />
                    </div>

                    {/* Description Field */}
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Event description"
                        className="min-h-[100px] dark:bg-slate-700"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Date and Time Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          type="date"
                          id="date"
                          name="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-md px-3 py-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          type="time"
                          id="start_time"
                          name="start_time"
                          required
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-md px-3 py-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <select
                          id="duration"
                          name="duration"
                          required
                          className="mt-1 block w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-md px-3 py-2"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        >
                          <option value="">Select duration</option>
                          <option value="0.5">Half an hour</option>
                          <option value="1">1 hour</option>
                          <option value="2">2 hours</option>
                          <option value="3">3 hours</option>
                          <option value="4">4 hours</option>
                          <option value="All day">All day</option>
                        </select>
                      </div>
                    </div>

                    {/* Category Field */}
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        name="category"
                        required
                        className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-md px-3 py-2"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">Select a category</option>
                        <option value="General Meeting">General Meeting</option>
                        <option value="Sub Meeting">Sub Meeting</option>
                        <option value="Allocations">Allocations</option>
                        <option value="Social">Social</option>
                        <option value="AGM">AGM</option>
                        <option value="EGM">EGM</option>
                        <option value="General Maintenance">
                          General Maintenance
                        </option>
                        <option value="Training">Training</option>
                        <option value="Treasury Meeting">
                          Treasury Meeting
                        </option>
                        <option value="Development">Development</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
