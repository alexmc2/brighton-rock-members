// app/(default)/co-op-socials/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { SocialEventWithDetails } from '@/types/social';
import SocialEventHeader from './social-event-header';
import SocialEventDetails from './social-event-details';
import CommentSection from '@/components/ui/comments-section';

export const metadata: Metadata = {
  title: 'Social Event Details',
  description: 'View and manage social event details',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SocialEventPageProps {
  params: { id: string };
}

async function getSocialEventById(id: string) {
  try {
    const { data: event, error } = await supabaseAdmin
      .from('social_events')
      .select(
        `
        *,
        created_by_user:profiles!social_events_created_by_fkey(
          id,
          email,
          full_name
        ),
        comments:social_event_comments(
          *,
          user:profiles!social_event_comments_user_id_fkey(
            id,
            email,
            full_name
          )
        ),
        participants:social_event_participants(
          *,
          user:profiles!social_event_participants_user_id_fkey(
            id,
            email,
            full_name
          )
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return event as SocialEventWithDetails;
  } catch (err) {
    console.error('Error fetching social event:', err);
    return null;
  }
}

export default async function SocialEventPage({
  params,
}: SocialEventPageProps) {
  const event = await getSocialEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <SocialEventHeader event={event} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 space-y-6">
          <SocialEventDetails event={event} />
          <CommentSection
            comments={event.comments}
            resourceId={event.id}
            resourceType={{
              type: 'social_event',
              field: 'event_id',
              contentField: 'content',
              userField: 'user_id',
            }}
          />
        </div>
      </div>
    </div>
  );
}
