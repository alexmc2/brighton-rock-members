// app/(default)/development/page.tsx

import DevelopmentHeader from './development-header'; // Import the header component
import InitiativeList from './development-list';
import { DevelopmentInitiativeWithDetails } from '@/types/development';
import supabaseAdmin from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getInitiatives() {
  try {
    const { data: initiatives, error } = await supabaseAdmin
      .from('development_initiatives')
      .select(
        `
        *,
        created_by_user:profiles!development_initiatives_created_by_fkey(email, full_name),
        comments:development_comments(
          *,
          user:profiles!development_comments_user_id_fkey(
            email,
            full_name
          )
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching initiatives:', error);
      return [];
    }

    return initiatives as DevelopmentInitiativeWithDetails[];
  } catch (err) {
    console.error('Error fetching initiatives:', err);
    return [];
  }
}

export default async function DevelopmentPage() {
  const initiatives = await getInitiatives();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Include the DevelopmentHeader here */}
      <DevelopmentHeader />
      <InitiativeList initiatives={initiatives} />
    </div>
  );
}
