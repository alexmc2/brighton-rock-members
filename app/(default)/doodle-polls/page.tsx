// app/(default)/doodle-polls/page.tsx
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { DoodlePoll } from '@/types/doodle';
import DoodlePollsList from './doodle-polls-list';
import DoodlePollsHeader from './doodle-polls-header';

export const metadata: Metadata = {
  title: 'Doodle polls - Brighton Rock',
  description: 'Schedule events and tasks with Doodle polls',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getDoodlePolls() {
  const supabase = createServerComponentClient({ cookies });

  const { data: polls } = await supabase
    .from('doodle_polls')
    .select(
      `
      *,
      created_by_user:profiles!doodle_polls_created_by_fkey(email, full_name),
      options:doodle_poll_options(*),
      participants:doodle_poll_participants(
        *,
        user:profiles!doodle_poll_participants_user_id_fkey(email, full_name)
      )
    `
    )
    .order('created_at', { ascending: false });

  return (polls as DoodlePoll[]) || [];
}

export default async function DoodlePollsPage() {
  const supabase = createServerComponentClient({ cookies });
  const polls = await getDoodlePolls();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <DoodlePollsHeader />
      <DoodlePollsList polls={polls} currentUserId={user?.id} />
    </div>
  );
}
