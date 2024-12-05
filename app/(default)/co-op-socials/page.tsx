// app/(default)/co-op-socials/page.tsx
import { Metadata } from 'next';
import supabaseAdmin from '@/lib/supabaseAdmin';
import SocialEventsHeader from './social-events-header';
import SocialEventsList from './social-events-list';
import { SocialEventWithDetails } from '@/types/social';

export const metadata: Metadata = {
  title: 'Co-op Social Events',
  description: 'View and manage co-op social events',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSocialEvents() {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('social_events')
      .select(
        `
        *,
        created_by_user:profiles!social_events_created_by_fkey(email, full_name),
        comments:social_event_comments(
          *,
          user:profiles!social_event_comments_user_id_fkey(email, full_name)
        ),
        participants:social_event_participants(
          *,
          user:profiles!social_event_participants_user_id_fkey(email, full_name)
        )
      `
      )
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching social events:', error);
      return [];
    }

    return events as SocialEventWithDetails[];
  } catch (err) {
    console.error('Error fetching social events:', err);
    return [];
  }
}

export default async function CoOpSocialsPage() {
  const events = await getSocialEvents();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <SocialEventsHeader />
      <SocialEventsList events={events} />
    </div>
  );
}

