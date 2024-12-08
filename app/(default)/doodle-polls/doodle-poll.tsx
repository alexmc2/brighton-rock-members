// // app/(default)/doodle-polls/doodle-poll.tsx

// 'use client';

// import { useState } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Avatar } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { CheckCircle2, CircleSlash } from 'lucide-react';
// import { cn, getUserColor } from '@/lib/utils';
// import { format } from 'date-fns';
// import type { DoodlePoll, DoodlePollResponse } from '@/types/doodle';
// import { useRouter } from 'next/navigation';
// import CreateEventButton from './create-event-button';

// interface DoodlePollProps {
//   poll: DoodlePoll;
//   currentUserId?: string;
//   currentUserName?: string;
// }

// export default function DoodlePoll({
//   poll,
//   currentUserId,
//   currentUserName,
// }: DoodlePollProps) {
//   const router = useRouter();
//   const supabase = createClientComponentClient();

//   // Format poll options for display
//   const timeSlots = poll.options.map((option) => ({
//     ...option,
//     day: format(new Date(option.date), 'EEE').toUpperCase(),
//     dayOfMonth: parseInt(format(new Date(option.date), 'd')),
//     month: format(new Date(option.date), 'MMM'),
//     times: option.start_time
//       ? ([
//           format(new Date(`2000-01-01T${option.start_time}`), 'HH:mm'),
//           option.duration ? `${option.duration}h` : null,
//         ].filter(Boolean) as string[])
//       : [],
//   }));

//   // Find current user's responses if they exist
//   const currentUserParticipant = poll.participants.find(
//     (p) => p.user_id === currentUserId
//   );

//   // Initialize userResponses with current user's responses or empty object
//   const [userResponses, setUserResponses] = useState<
//     Record<string, DoodlePollResponse>
//   >(currentUserParticipant?.responses || {});

//   const toggleResponse = async (optionId: string) => {
//     if (poll.closed || !currentUserId) return;

//     const newResponses = { ...userResponses };
//     const current = newResponses[optionId];

//     if (!current || current === 'no') {
//       newResponses[optionId] = 'yes';
//     } else if (current === 'yes') {
//       newResponses[optionId] = 'maybe';
//     } else {
//       newResponses[optionId] = 'no';
//     }

//     try {
//       if (currentUserParticipant) {
//         // Update existing participant
//         await supabase
//           .from('doodle_poll_participants')
//           .update({
//             responses: newResponses,
//             updated_at: new Date().toISOString(),
//           })
//           .eq('id', currentUserParticipant.id);
//       } else {
//         // Create new participant
//         await supabase.from('doodle_poll_participants').insert({
//           poll_id: poll.id,
//           user_id: currentUserId,
//           responses: newResponses,
//         });
//       }

//       // Update local state
//       setUserResponses(newResponses);

//       // Refresh the page to get updated data
//       router.refresh();
//     } catch (error) {
//       console.error('Error updating response:', error);
//     }
//   };

//   // Calculate participants count excluding those with no responses
//   const participantsCount = new Set(
//     poll.participants
//       .filter((p) =>
//         Object.values(p.responses).some((r) => r === 'yes' || r === 'maybe')
//       )
//       .map((p) => p.user_id)
//   ).size;

//   // Get available count for an option
//   const getAvailableCount = (optionId: string) => {
//     // Only count unique users who responded 'yes'
//     const uniqueYesResponders = new Set(
//       poll.participants
//         .filter((p) => p.responses[optionId] === 'yes')
//         .map((p) => p.user_id)
//     );

//     return uniqueYesResponders.size;
//   };

//   return (
//     <Card className="p-6">
//       {/* Event Details Header */}
//       <div className="mb-6 space-y-2">
//         <h2 className="text-2xl font-semibold">{poll.title}</h2>
//         <div className="text-sm text-gray-600 space-y-1">
//           <p>
//             <span className="font-medium">Type:</span>{' '}
//             {poll.event_type === 'social_event'
//               ? 'Co-op Social'
//               : poll.event_type === 'garden_task'
//               ? 'Garden Task'
//               : 'Development Event'}
//           </p>
//           <p>
//             <span className="font-medium">Created by:</span>{' '}
//             {poll.created_by_user.full_name || poll.created_by_user.email}
//           </p>
//           {poll.description && (
//             <p>
//               <span className="font-medium">Description:</span>{' '}
//               {poll.description}
//             </p>
//           )}
//         </div>
//       </div>

//       <div className="border rounded-lg">
//         {/* Header */}
//         <div className="grid grid-cols-[2fr_repeat(4,1fr)] border-b">
//           <div className="p-4" />
//           {timeSlots.map((slot) => (
//             <div key={slot.id} className="p-4 text-center border">
//               <div className="text-gray-600">{slot.month}</div>
//               <div className="text-2xl font-bold">{slot.dayOfMonth}</div>
//               <div className="text-gray-600">{slot.day}</div>
//               {slot.times.map((time) => (
//                 <div key={time} className="text-sm text-gray-600 mt-1">
//                   {time}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>

//         {/* Participants count */}
//         <div className="grid grid-cols-[2fr_repeat(4,1fr)] border-b bg-gray-50">
//           <div className="p-4 text-gray-600">
//             {participantsCount === 0
//               ? 'No responses yet'
//               : `${participantsCount} ${
//                   participantsCount === 1 ? 'response' : 'responses'
//                 }`}
//           </div>
//           {timeSlots.map((slot) => (
//             <div key={slot.id} className="p-4 text-center border">
//               <div className="text-blue-600 flex items-center justify-center gap-1">
//                 {/* Number of people that said "yes" */}
//                 <CheckCircle2 className="w-4 h-4" />
//                 {getAvailableCount(slot.id)}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Only allow toggling responses if user is logged in and poll is not closed */}
//         {!poll.closed && currentUserId && (
//           <div className="grid grid-cols-[2fr_repeat(4,1fr)] border-b bg-blue-50">
//             <div className="p-4 flex items-center text-gray-600">
//               Responding as:{' '}
//               <span className="ml-2 font-medium">
//                 {currentUserParticipant?.user?.full_name ||
//                   currentUserName ||
//                   'User'}
//               </span>
//             </div>
//             {timeSlots.map((slot) => (
//               <Button
//                 key={slot.id}
//                 variant="ghost"
//                 className={cn(
//                   'h-full rounded-none border',
//                   userResponses[slot.id] === 'yes' && 'bg-green-100',
//                   userResponses[slot.id] === 'maybe' && 'bg-yellow-100'
//                 )}
//                 onClick={() => toggleResponse(slot.id)}
//               >
//                 {userResponses[slot.id] === 'yes' && (
//                   <CheckCircle2 className="w-5 h-5 text-green-600" />
//                 )}
//                 {userResponses[slot.id] === 'maybe' && (
//                   <CheckCircle2 className="w-5 h-5 text-yellow-600" />
//                 )}
//                 {(!userResponses[slot.id] ||
//                   userResponses[slot.id] === 'no') && (
//                   <CircleSlash className="w-5 h-5 text-gray-300" />
//                 )}
//               </Button>
//             ))}
//           </div>
//         )}

//         {/* Existing participants */}
//         {poll.participants
//           .filter((participant) =>
//             Object.values(participant.responses).some(
//               (r) => r === 'yes' || r === 'maybe'
//             )
//           )
//           .map((participant) => (
//             <div
//               key={participant.id}
//               className="grid grid-cols-[2fr_repeat(4,1fr)] border-b last:border-b-0"
//             >
//               <div className="p-4 flex items-center gap-2">
//                 <Avatar
//                   className={cn(
//                     'w-6 h-6 flex items-center justify-center',
//                     getUserColor(participant.user_id)
//                   )}
//                 >
//                   <div className="text-white text-xs">
//                     {participant.user.full_name?.[0]?.toUpperCase() ||
//                       participant.user.email[0].toUpperCase()}
//                   </div>
//                 </Avatar>
//                 <span>
//                   {participant.user.full_name || participant.user.email}
//                 </span>
//               </div>
//               {timeSlots.map((slot) => (
//                 <div
//                   key={slot.id}
//                   className={cn(
//                     'border-l p-4 flex items-center justify-center',
//                     participant.responses[slot.id] === 'yes' && 'bg-green-100',
//                     participant.responses[slot.id] === 'maybe' &&
//                       'bg-yellow-100'
//                   )}
//                 >
//                   {participant.responses[slot.id] === 'yes' && (
//                     <CheckCircle2 className="w-5 h-5 text-green-600" />
//                   )}
//                   {participant.responses[slot.id] === 'maybe' && (
//                     <CheckCircle2 className="w-5 h-5 text-yellow-600" />
//                   )}
//                 </div>
//               ))}
//             </div>
//           ))}
//       </div>
//       {/* Create Event Button */}
//       <CreateEventButton
//         poll={poll}
//         options={poll.options}
//         participants={poll.participants}
//       />
//     </Card>
//   );
// }
