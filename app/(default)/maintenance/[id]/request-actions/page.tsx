// // app/(default)/maintenance/[id]/request-actions/page.tsx

// import { Metadata } from 'next';
// import { notFound } from 'next/navigation';
// import supabaseAdmin from '@/lib/supabaseAdmin';
// import { MaintenanceRequestWithDetails } from '@/types/maintenance';
// import EditMaintenanceForm from './edit-form';

// export const metadata: Metadata = {
//   title: 'Edit Maintenance Request - Co-op Management',
//   description: 'Edit maintenance request details',
// };

// // Force dynamic rendering to ensure fresh data
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// async function getMaintenanceRequest(id: string) {
//   try {
//     const { data: request, error } = await supabaseAdmin
//       .from('maintenance_requests')
//       .select(
//         `
//         *,
//         house:houses!maintenance_requests_house_id_fkey(id, name),
//         reported_by_user:profiles!maintenance_requests_reported_by_fkey(email),
//         visits:maintenance_visits(
//           id,
//           scheduled_date,
//           estimated_duration,
//           notes,
//           completed_at
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

//     return request as MaintenanceRequestWithDetails;
//   } catch (err) {
//     console.error('Error fetching maintenance request:', err);
//     return null;
//   }
// }

// async function getHouses() {
//   try {
//     const { data: houses, error } = await supabaseAdmin
//       .from('houses')
//       .select('id, name')
//       .order('name');

//     if (error) throw error;
//     return houses;
//   } catch (err) {
//     console.error('Error fetching houses:', err);
//     return [];
//   }
// }

// interface MaintenanceRequestPageProps {
//   params: {
//     id: string;
//   };
// }

// export default async function RequestActionsPage({
//   params,
// }: MaintenanceRequestPageProps) {
//   const [request, houses] = await Promise.all([
//     getMaintenanceRequest(params.id),
//     getHouses(),
//   ]);

//   if (!request) {
//     notFound();
//   }

//   return (
//     <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
//       <EditMaintenanceForm request={request} houses={houses} />
//     </div>
//   );
// }
