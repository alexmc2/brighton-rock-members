// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import {
//   MaintenanceRequestWithDetails,
//   MaintenancePriority,
//   MaintenanceStatus,
// } from '@/types/maintenance';
// import Link from 'next/link';
// import { format } from 'date-fns';
// import { Button } from '@/components/ui/button';
// import VisitForm from '@/components/visit-form';

// interface EditMaintenanceFormProps {
//   request: MaintenanceRequestWithDetails;
//   houses: { id: string; name: string }[];
// }

// export default function EditMaintenanceForm({
//   request,
//   houses,
// }: EditMaintenanceFormProps) {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [title, setTitle] = useState(request.title);
//   const [description, setDescription] = useState(request.description);
//   const [priority, setPriority] = useState<MaintenancePriority>(
//     request.priority
//   );
//   const [status, setStatus] = useState<MaintenanceStatus>(request.status);
//   const [houseId, setHouseId] = useState(request.house_id);
//   const [editingVisit, setEditingVisit] = useState<string | null>(null);
//   const supabase = createClientComponentClient();
//   const now = new Date();

//   // Separate visits into upcoming and past
//   const upcomingVisits = request.visits
//     .filter((v) => !v.completed_at && new Date(v.scheduled_date) > now)
//     .sort(
//       (a, b) =>
//         new Date(a.scheduled_date).getTime() -
//         new Date(b.scheduled_date).getTime()
//     );

//   const pastVisits = request.visits
//     .filter((v) => v.completed_at || new Date(v.scheduled_date) <= now)
//     .sort(
//       (a, b) =>
//         new Date(b.scheduled_date).getTime() -
//         new Date(a.scheduled_date).getTime()
//     );

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const { error: updateError } = await supabase
//         .from('maintenance_requests')
//         .update({
//           title,
//           description,
//           priority,
//           status,
//           house_id: houseId,
//         })
//         .eq('id', request.id);

//       if (updateError) throw updateError;

//       router.push(`/maintenance/${request.id}`);
//     } catch (err) {
//       console.error('Error updating request:', err);
//       setError('Failed to update request');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleVisitUpdate = async (
//     visitId: string,
//     e: React.FormEvent<HTMLFormElement>
//   ) => {
//     e.preventDefault();
//     if (isSubmitting) return;

//     setIsSubmitting(true);
//     const form = e.currentTarget;
//     const formData = new FormData(form);

//     try {
//       // Get current user
//       const {
//         data: { user },
//         error: userError,
//       } = await supabase.auth.getUser();
//       if (userError || !user) throw new Error('User not authenticated');

//       // Get user's profile for name
//       const { data: profile, error: profileError } = await supabase
//         .from('profiles')
//         .select('email, full_name')
//         .eq('id', user.id)
//         .single();
//       if (profileError) throw profileError;

//       const scheduledDate = `${formData.get('scheduled_date')}T${formData.get(
//         'scheduled_time'
//       )}:00`;
//       const estimatedDuration = `${formData.get('estimated_duration')} hours`;
//       const notes = formData.get('notes') || null;

//       // Update the visit
//       const { error: updateError } = await supabase
//         .from('maintenance_visits')
//         .update({
//           scheduled_date: scheduledDate,
//           estimated_duration: estimatedDuration,
//           notes,
//         })
//         .eq('id', visitId);

//       if (updateError) throw updateError;

//       // Calculate end time
//       const startTime = new Date(scheduledDate);
//       const durationHours = parseInt(
//         formData.get('estimated_duration') as string
//       );
//       const endTime = new Date(
//         startTime.getTime() + durationHours * 60 * 60 * 1000
//       );

//       // First delete existing calendar event
//       await supabase
//         .from('calendar_events')
//         .delete()
//         .eq('reference_id', visitId)
//         .eq('event_type', 'maintenance_visit');

//       // Create new calendar event with correct metadata
//       const { error: calendarError } = await supabase
//         .from('calendar_events')
//         .insert({
//           title: 'P4P Visit',
//           description: `Maintenance visit for: ${request.title}${
//             notes ? `\nNotes: ${notes}` : ''
//           }`,
//           start_time: startTime.toISOString(),
//           end_time: endTime.toISOString(),
//           event_type: 'maintenance_visit',
//           category: 'P4P Visit',
//           created_by: user.id,
//           reference_id: visitId,
//           full_name: profile.full_name || profile.email,
//         });

//       if (calendarError) throw calendarError;

//       setEditingVisit(null);
//       router.refresh();
//     } catch (err) {
//       console.error('Error updating visit:', err);
//       setError(err instanceof Error ? err.message : 'Failed to update visit');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleVisitDelete = async (visitId: string) => {
//     if (!window.confirm('Are you sure you want to delete this visit?')) {
//       return;
//     }

//     try {
//       const { error } = await supabase
//         .from('maintenance_visits')
//         .delete()
//         .eq('id', visitId);

//       if (error) throw error;

//       router.refresh();
//     } catch (err) {
//       console.error('Error deleting visit:', err);
//       setError('Failed to delete visit');
//     }
//   };

//   const handleDelete = async () => {
//     if (
//       !window.confirm(
//         'Are you sure you want to delete this maintenance request? This action cannot be undone.'
//       )
//     ) {
//       return;
//     }

//     setIsDeleting(true);
//     setError(null);

//     try {
//       // First delete all visits
//       const { error: visitsError } = await supabase
//         .from('maintenance_visits')
//         .delete()
//         .eq('request_id', request.id);

//       if (visitsError) throw visitsError;

//       // Then delete all comments
//       const { error: commentsError } = await supabase
//         .from('maintenance_comments')
//         .delete()
//         .eq('request_id', request.id);

//       if (commentsError) throw commentsError;

//       // Finally delete the request
//       const { error: deleteError } = await supabase
//         .from('maintenance_requests')
//         .delete()
//         .eq('id', request.id);

//       if (deleteError) throw deleteError;

//       router.push('/maintenance');
//     } catch (err) {
//       console.error('Error deleting request:', err);
//       setError('Failed to delete request');
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <>
//       <div className="mb-8 flex justify-between items-center">
//         <div>
//           <Link
//             href={`/maintenance/${request.id}`}
//             className="text-sm font-medium text-coop-600 hover:text-coop-700"
//           >
//             ← Back to Maintenance Request
//           </Link>
//           <h1 className="text-2xl font-bold mt-2">Edit Maintenance Request</h1>
//         </div>
//         <Button
//           onClick={handleDelete}
//           disabled={isDeleting}
//           variant="destructive"
//         >
//           {isDeleting ? 'Deleting...' : 'Delete Request'}
//         </Button>
//       </div>

//       <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg border border-slate-200 dark:border-slate-700 p-6">
//         {error && (
//           <div className="mb-4 p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 rounded">
//             {error}
//           </div>
//         )}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-4">
//             {/* Request Details */}
//             <div>
//               <label
//                 htmlFor="title"
//                 className="block text-sm font-medium text-slate-700 dark:text-slate-300"
//               >
//                 Title
//               </label>
//               <input
//                 type="text"
//                 id="title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 required
//                 className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="description"
//                 className="block text-sm font-medium text-slate-700 dark:text-slate-300"
//               >
//                 Description
//               </label>
//               <textarea
//                 id="description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 required
//                 rows={3}
//                 className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="house_id"
//                 className="block text-sm font-medium text-slate-700 dark:text-slate-300"
//               >
//                 House
//               </label>
//               <select
//                 id="house_id"
//                 value={houseId}
//                 onChange={(e) => setHouseId(e.target.value)}
//                 required
//                 className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
//               >
//                 {houses.map((house) => (
//                   <option key={house.id} value={house.id}>
//                     {house.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label
//                 htmlFor="priority"
//                 className="block text-sm font-medium text-slate-700 dark:text-slate-300"
//               >
//                 Priority
//               </label>
//               <select
//                 id="priority"
//                 value={priority}
//                 onChange={(e) =>
//                   setPriority(e.target.value as MaintenancePriority)
//                 }
//                 required
//                 className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
//               >
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//                 <option value="urgent">Urgent</option>
//               </select>
//             </div>

//             <div>
//               <label
//                 htmlFor="status"
//                 className="block text-sm font-medium text-slate-700 dark:text-slate-300"
//               >
//                 Status
//               </label>
//               <select
//                 id="status"
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
//                 required
//                 className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-coop-500 focus:outline-none focus:ring-1 focus:ring-coop-500"
//               >
//                 <option value="pending">Pending</option>
//                 <option value="scheduled">Scheduled</option>
//                 <option value="in_progress">In Progress</option>
//                 <option value="completed">Completed</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>

//             <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
//               <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-4">
//                 Scheduled Visits
//               </h3>
//               <div className="space-y-3">
//                 {/* Upcoming Visits */}
//                 {upcomingVisits.length > 0 && (
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
//                       Upcoming Visits
//                     </h4>
//                     {upcomingVisits.map((visit) => (
//                       <div
//                         key={visit.id}
//                         className="flex items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-2"
//                       >
//                         {editingVisit === visit.id ? (
//                           <VisitForm
//                             visit={visit}
//                             onSubmit={(e) => handleVisitUpdate(visit.id, e)}
//                             onCancel={() => setEditingVisit(null)}
//                             isSubmitting={isSubmitting}
//                           />
//                         ) : (
//                           <>
//                             <div className="grow">
//                               <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
//                                 {format(
//                                   new Date(visit.scheduled_date),
//                                   'MMM d, yyyy h:mm a'
//                                 )}
//                               </div>
//                               <div className="text-sm text-slate-600 dark:text-slate-300">
//                                 Estimated Duration: {visit.estimated_duration}
//                               </div>
//                               {visit.notes && (
//                                 <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
//                                   Notes: {visit.notes}
//                                 </div>
//                               )}
//                             </div>
//                             <div className="flex space-x-2">
//                               <Button
//                                 onClick={() => setEditingVisit(visit.id)}
//                                 variant="outline"
//                                 size="sm"
//                               >
//                                 Edit
//                               </Button>
//                               <Button
//                                 onClick={() => handleVisitDelete(visit.id)}
//                                 variant="destructive"
//                                 size="sm"
//                               >
//                                 Delete
//                               </Button>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Past Visits */}
//                 {pastVisits.length > 0 && (
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
//                       Past Visits
//                     </h4>
//                     {pastVisits.map((visit) => (
//                       <div
//                         key={visit.id}
//                         className="flex items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-2"
//                       >
//                         <div className="grow">
//                           <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
//                             {format(
//                               new Date(visit.scheduled_date),
//                               'MMM d, yyyy h:mm a'
//                             )}
//                           </div>
//                           <div className="text-sm text-slate-600 dark:text-slate-300">
//                             Estimated Duration: {visit.estimated_duration}
//                           </div>
//                           {visit.notes && (
//                             <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
//                               Notes: {visit.notes}
//                             </div>
//                           )}
//                         </div>
//                         {visit.completed_at && (
//                           <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
//                             Completed
//                           </span>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {request.visits.length === 0 && (
//                   <p className="text-sm text-slate-500 dark:text-slate-400">
//                     No visits scheduled yet
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
//             <Button variant="ghost" asChild>
//               <Link href={`/maintenance/${request.id}`}>Cancel</Link>
//             </Button>
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// }
