import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { MaintenanceRequestWithDetails } from '@/types/maintenance'
import RequestHeader from './request-header'
import RequestDetails from './request-details'
import VisitScheduler from './visit-scheduler'
import CommentSection from './comment-section'

export const metadata: Metadata = {
  title: 'Maintenance Request - Co-op Management',
  description: 'View and manage maintenance request details',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getMaintenanceRequest(id: string) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const { data: request, error } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        house:houses!maintenance_requests_house_id_fkey(name),
        reported_by_user:profiles!maintenance_requests_reported_by_fkey(email),
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
            email
          )
        )
      `)
      .eq('id', id)
      .order('created_at', { foreignTable: 'maintenance_visits', ascending: true })
      .order('created_at', { foreignTable: 'maintenance_comments', ascending: true })
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return request as MaintenanceRequestWithDetails
  } catch (err) {
    console.error('Error fetching maintenance request:', err)
    return null
  }
}

interface MaintenanceRequestPageProps {
  params: {
    id: string
  }
}

export default async function MaintenanceRequestPage({ params }: MaintenanceRequestPageProps) {
  const request = await getMaintenanceRequest(params.id)

  if (!request) {
    notFound()
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <RequestHeader request={request} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Left column - Request details and comments */}
        <div className="xl:col-span-2 space-y-6">
          <RequestDetails request={request} />
          <CommentSection request={request} />
        </div>
        
        {/* Right column - Visit scheduling */}
        <div>
          <VisitScheduler request={request} />
        </div>
      </div>
    </div>
  )
} 