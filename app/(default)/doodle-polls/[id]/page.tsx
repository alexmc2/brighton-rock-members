// // app/(default)/doodle-polls/[id]/page.tsx

// import { Metadata } from 'next';
// import { notFound } from 'next/navigation';
// import { cookies } from 'next/headers';
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// import supabaseAdmin from '@/lib/supabaseAdmin';
// import type { DoodlePollWithDetails } from '@/types/doodle';
// import DoodlePollDetails from './doodle-poll-details';

// export const metadata: Metadata = {
//   title: 'Doodle Poll Details',
//   description: 'View and respond to doodle poll',
// };

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// interface DoodlePollPageProps {
//   params: { id: string };
// }

// async function getDoodlePollById(id: string) {
//   try {
//     const { data: poll, error } = await supabaseAdmin
//       .from('doodle_polls')
//       .select(
//         `
//         *,
//         created_by_user:profiles!doodle_polls_created_by_fkey(
//           id,
//           email,
//           full_name
//         ),
//         options:doodle_poll_options(*),
//         participants:doodle_poll_participants(
//           *,
//           user:profiles!doodle_poll_participants_user_id_fkey(
//             id,
//             email,
//             full_name
//           )
//         )
//       `
//       )
//       .eq('id', id)
//       .single();

//     if (error) {
//       if (error.code === 'PGRST116') {
//         return null;
//       }
//       throw error;
//     }

//     return poll as DoodlePollWithDetails;
//   } catch (err) {
//     console.error('Error fetching doodle poll:', err);
//     return null;
//   }
// }

// export default async function DoodlePollPage({
//   params,
// }: DoodlePollPageProps) {
//   const supabase = createServerComponentClient({ cookies });
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const poll = await getDoodlePollById(params.id);

//   if (!poll) {
//     notFound();
//   }

//   // Get user profile data
//   const { data: profile } = await supabase
//     .from('profiles')
//     .select('*')
//     .eq('id', user?.id)
//     .single();

//   return (
//     <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
//       <DoodlePollDetails 
//         poll={poll} 
//         currentUserId={user?.id}
//         currentUserName={profile?.full_name}
//       />
//     </div>
//   );
// } 

// app/(default)/doodle-polls/[id]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import supabaseAdmin from '@/lib/supabaseAdmin';
import type { DoodlePollWithDetails } from '@/types/doodle';
import DoodlePollDetails from './doodle-poll-details';
import DoodlePollHeader from './doodle-poll-header';

export const metadata: Metadata = {
  title: 'Doodle Poll Details',
  description: 'View and respond to doodle poll',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DoodlePollPageProps {
  params: { id: string };
}

async function getDoodlePollById(id: string) {
  try {
    const { data: poll, error } = await supabaseAdmin
      .from('doodle_polls')
      .select(
        `
        *,
        created_by_user:profiles!doodle_polls_created_by_fkey(
          id,
          email,
          full_name
        ),
        options:doodle_poll_options(*),
        participants:doodle_poll_participants(
          *,
          user:profiles!doodle_poll_participants_user_id_fkey(
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

    return poll as DoodlePollWithDetails;
  } catch (err) {
    console.error('Error fetching doodle poll:', err);
    return null;
  }
}

export default async function DoodlePollPage({
  params,
}: DoodlePollPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const poll = await getDoodlePollById(params.id);

  if (!poll) {
    notFound();
  }

  // Get user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <DoodlePollHeader poll={poll} />
      <DoodlePollDetails
        poll={poll}
        currentUserId={user?.id}
        currentUserName={profile?.full_name}
      />
    </div>
  );
}
