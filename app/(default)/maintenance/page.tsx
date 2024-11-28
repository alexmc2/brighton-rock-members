import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MaintenanceList from './maintenance-list'
import MaintenanceHeader from './maintenance-header'
import { MaintenanceRequestWithDetails } from '@/types/maintenance'

export const metadata: Metadata = {
  title: 'Maintenance - Co-op Management',
  description: 'Manage maintenance requests and visits',
}

async function getMaintenanceRequests() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: requests, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      house:houses!maintenance_requests_house_id_fkey(name),
      reported_by_user:profiles!maintenance_requests_reported_by_fkey(email),
      visits:maintenance_visits(*),
      comments:maintenance_comments(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching maintenance requests:', error)
    return []
  }

  return requests as MaintenanceRequestWithDetails[]
}

export default async function MaintenancePage() {
  const requests = await getMaintenanceRequests()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Page header */}
      <MaintenanceHeader />

      {/* Table */}
      <MaintenanceList requests={requests} />
    </div>
  )
} 