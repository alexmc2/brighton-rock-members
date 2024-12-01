// app/(default)/development/[id]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { DevelopmentInitiativeWithDetails } from '@/types/development';
import InitiativeHeader from './initiative-header';
import InitiativeDetails from './initiative-details';
import CommentSection from './comment-section';

export const metadata: Metadata = {
  title: 'Development Initiative Details',
  description: 'View and manage development initiative details',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getInitiative(id: string) {
  try {
    const { data: initiative, error } = await supabaseAdmin
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
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return initiative as DevelopmentInitiativeWithDetails;
  } catch (err) {
    console.error('Error fetching initiative:', err);
    return null;
  }
}

interface InitiativeDetailPageProps {
  params: {
    id: string;
  };
}

export default async function InitiativeDetailPage({
  params,
}: InitiativeDetailPageProps) {
  const initiative = await getInitiative(params.id);

  if (!initiative) {
    notFound();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <InitiativeHeader initiative={initiative} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Left column - Initiative details and comments */}
        <div className="xl:col-span-2 space-y-6">
          <InitiativeDetails initiative={initiative} />
          <CommentSection initiative={initiative} />
        </div>
      </div>
    </div>
  );
}
