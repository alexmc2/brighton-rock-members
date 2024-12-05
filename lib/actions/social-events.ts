// // lib/actions/social-events.ts

// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { SocialEvent, SocialEventWithDetails } from '@/types/social';

// export async function getSocialEvents(): Promise<SocialEventWithDetails[]> {
//   const supabase = createClientComponentClient();

//   const { data: events, error } = await supabase
//     .from('social_events')
//     .select(
//       `
//       *,
//       created_by_user:profiles!social_events_created_by_fkey(email, full_name),
//       comments:social_event_comments(
//         *,
//         user:profiles!social_event_comments_user_id_fkey(email, full_name)
//       ),
//       participants:social_event_participants(
//         *,
//         user:profiles!social_event_participants_user_id_fkey(email, full_name)
//       )
//     `
//     )
//     .order('event_date', { ascending: true });

//   if (error) {
//     console.error('Error fetching social events:', error);
//     return [];
//   }

//   return events as SocialEventWithDetails[];
// }


// export async function createSocialEvent(
//   eventData: Partial<SocialEvent>
// ): Promise<SocialEvent | null> {
//   const supabase = createClientComponentClient();

//   const { data: event, error } = await supabase
//     .from('social_events')
//     .insert(eventData)
//     .select()
//     .single();

//   if (error) {
//     console.error('Error creating social event:', error);
//     return null;
//   }

//   return event as SocialEvent;
// }


// export async function getSocialEventById(id: string): Promise<SocialEventWithDetails | null> {
//   const supabase = createClientComponentClient();

//   const { data: event, error } = await supabase
//     .from('social_events')
//     .select(
//       `
//       *,
//       created_by_user:profiles!social_events_created_by_fkey(email, full_name),
//       comments:social_event_comments(
//         *,
//         user:profiles!social_event_comments_user_id_fkey(email, full_name)
//       ),
//       participants:social_event_participants(
//         *,
//         user:profiles!social_event_participants_user_id_fkey(email, full_name)
//       )
//     `
//     )
//     .eq('id', id)
//     .single();

//   if (error) {
//     console.error('Error fetching social event:', error);
//     return null;
//   }

//   return event as SocialEventWithDetails;
// }