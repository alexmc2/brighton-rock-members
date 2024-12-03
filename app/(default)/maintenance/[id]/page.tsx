import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import supabaseAdmin from '@/lib/supabaseAdmin';
import {
  MaintenanceRequestWithDetails,
  MaintenanceComment,
} from '@/types/maintenance';
import CommentSection from '@/components/ui/comments-section';
import RequestHeader from './request-header';
import RequestDetails from './request-details';
import VisitScheduler from './visit-scheduler';

export const metadata: Metadata = {
  title: 'Maintenance Request - Co-op Management',
  description: 'View and manage maintenance request details',
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getMaintenanceRequest(id: string) {
  try {
    const { data: request, error } = await supabaseAdmin
      .from('maintenance_requests')
      .select(
        `
        *,
        house:houses!maintenance_requests_house_id_fkey(name),
        reported_by_user:profiles!maintenance_requests_reported_by_fkey(email, full_name),
        assigned_to_user:profiles!maintenance_requests_assigned_to_fkey(email, full_name),
        visits:maintenance_visits(
          id,
          scheduled_date,
          estimated_duration,
          notes,
          completed_at,
          created_at
        ),
        comments:maintenance_comments(
          id,
          comment,
          created_at,
          user_id,
          user:profiles!maintenance_comments_user_id_fkey(
            email,
            full_name
          )
        )
      `
      )
      .eq('id', id)
      .order('created_at', {
        foreignTable: 'maintenance_visits',
        ascending: true,
      })
      .order('created_at', {
        foreignTable: 'maintenance_comments',
        ascending: true,
      })
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return request as MaintenanceRequestWithDetails;
  } catch (err) {
    console.error('Error fetching maintenance request:', err);
    return null;
  }
}

async function getHouses() {
  try {
    const { data: houses, error } = await supabaseAdmin
      .from('houses')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return houses;
  } catch (err) {
    console.error('Error fetching houses:', err);
    return [];
  }
}

interface MaintenanceRequestPageProps {
  params: {
    id: string;
  };
}

export default async function MaintenanceRequestPage({
  params,
}: MaintenanceRequestPageProps) {
  const request = await getMaintenanceRequest(params.id);

  if (!request) {
    notFound();
  }

  const houses = await getHouses();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <RequestHeader request={request} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2">
          <RequestDetails request={request} houses={houses} />
        </div>

        <div className="space-y-6">
          <VisitScheduler request={request} />
          <div className="xl:hidden">
            <CommentSection<MaintenanceComment>
              comments={request.comments}
              resourceId={request.id}
              resourceType={{
                type: 'maintenance',
                field: 'request_id',
                contentField: 'comment',
                userField: 'user_id',
              }}
            />
          </div>
        </div>

        <div className="hidden xl:block xl:col-span-2">
          <CommentSection<MaintenanceComment>
            comments={request.comments}
            resourceId={request.id}
            resourceType={{
              type: 'maintenance',
              field: 'request_id',
              contentField: 'comment',
              userField: 'user_id',
            }}
          />
        </div>
      </div>
    </div>
  );
}
