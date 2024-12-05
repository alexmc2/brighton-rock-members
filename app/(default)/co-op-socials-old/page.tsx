// app/(default)/co-op-socials/page.tsx

import SocialEventsHeader from './social-events-header';
import SocialEventsList from './social-events-list';
import { getSocialEvents } from '@/lib/actions/social-events';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CoOpSocialsPage() {
  const socialEvents = await getSocialEvents();
  
  // Serialize the date objects to prevent hydration mismatch
  const serializedEvents = socialEvents.map(event => ({
    ...event,
    created_at: event.created_at.toString(),
    updated_at: event.updated_at.toString(),
    event_date: event.event_date?.toString() || null,
    comments: event.comments.map(comment => ({
      ...comment,
      created_at: comment.created_at.toString()
    })),
    participants: event.participants?.map(participant => ({
      ...participant,
      created_at: participant.created_at.toString(),
      updated_at: participant.updated_at.toString()
    }))
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <SocialEventsHeader />
      <SocialEventsList events={serializedEvents} />
    </div>
  );
}
