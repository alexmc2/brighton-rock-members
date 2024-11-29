// app/(default)/maintenance/page.tsx

import { Metadata } from 'next';
import MaintenanceList from './maintenance-list';
import MaintenanceHeader from './maintenance-header';
import { MaintenanceRequestWithDetails } from '@/types/maintenance';
import supabaseAdmin from '@/lib/supabaseAdmin';

export const metadata: Metadata = {
  title: 'Maintenance - Co-op Management',
  description: 'Manage maintenance requests and visits',
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getMaintenanceRequests() {
  try {
    const { data: requests, error } = await supabaseAdmin
      .from('maintenance_requests')
      .select(
        `
        *,
        house:houses!maintenance_requests_house_id_fkey(id, name),
        reported_by_user:profiles!maintenance_requests_reported_by_fkey(email),
        visits:maintenance_visits(*),
        comments:maintenance_comments(*)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching maintenance requests:', error);
      return [];
    }

    return requests as MaintenanceRequestWithDetails[];
  } catch (err) {
    console.error('Error fetching maintenance requests:', err);
    return [];
  }
}

async function getHouses() {
  try {
    const { data: houses, error } = await supabaseAdmin
      .from('houses')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching houses:', error);
      return [];
    }

    return houses;
  } catch (err) {
    console.error('Error fetching houses:', err);
    return [];
  }
}

export default async function MaintenancePage() {
  const [requests, houses] = await Promise.all([
    getMaintenanceRequests(),
    getHouses(),
  ]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <MaintenanceHeader houses={houses} />
      <MaintenanceList requests={requests} />
    </div>
  );
}
