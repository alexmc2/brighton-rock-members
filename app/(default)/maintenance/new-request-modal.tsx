'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { MaintenancePriority } from '@/types/maintenance';

export default function NewRequestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [houses, setHouses] = useState<{ id: string; name: string }[]>([]);
  const [selectedHouses, setSelectedHouses] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchHouses() {
      const { data, error } = await supabase
        .from('houses')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching houses:', error);
        return;
      }

      setHouses(data || []);
    }

    if (isOpen) {
      fetchHouses();
      setSelectedHouses([]);
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  }, [isOpen, supabase]);

  const handleHouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setSelectedHouses(houses.map((house) => house.id));
    } else if (value === '') {
      setSelectedHouses([]);
    } else {
      setSelectedHouses([value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // First, ensure user profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) throw profileError;
      }

      if (selectedHouses.length === 0) {
        throw new Error('Please select a house');
      }

      const requests = selectedHouses.map((house_id) => ({
        title,
        description,
        house_id,
        priority,
        reported_by: user.id,
        status: 'pending',
      }));

      const { error: insertError } = await supabase
        .from('maintenance_requests')
        .insert(requests);

      if (insertError) throw insertError;

      router.refresh();
      setIsOpen(false);
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="btn bg-coop-600 hover:bg-coop-700 text-white"
        onClick={() => setIsOpen(true)}
      >
        <svg
          className="w-4 h-4 fill-current opacity-50 shrink-0"
          viewBox="0 0 16 16"
        >
          <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
        </svg>
        <span className="hidden xs:block ml-2">New Maintenance Job</span>
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white dark:bg-slate-800 p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    New Maintenance Request
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="house_id"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        House
                      </label>
                      <select
                        id="house_id"
                        required
                        onChange={handleHouseChange}
                        value={
                          selectedHouses.length === houses.length
                            ? 'all'
                            : selectedHouses[0] || ''
                        }
                        className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
                      >
                        <option value="">Select a house</option>
                        <option value="all">All Houses</option>
                        {houses.map((house) => (
                          <option key={house.id} value={house.id}>
                            {house.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="priority"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Priority
                      </label>
                      <select
                        id="priority"
                        value={priority}
                        onChange={(e) =>
                          setPriority(e.target.value as MaintenancePriority)
                        }
                        required
                        className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md bg-coop-600 px-3 py-2 text-sm font-semibold text-white hover:bg-coop-700 focus:outline-none focus:ring-2 focus:ring-coop-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Creating...' : 'Create Request'}
                      </button>
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
