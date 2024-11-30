// // app/(default)/garden/new-garden-task-modal.tsx

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { GardenTaskPriority } from '@/types/garden';
// import { Plus } from 'lucide-react';
// import { createGardenTaskEvent } from '@/lib/actions/calendar';

// export default function NewGardenTaskModal() {
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
//   const supabase = createClientComponentClient();

//   const fetchAreas = async () => {
//     const { data, error } = await supabase
//       .from('garden_areas')
//       .select('id, name')
//       .order('name');

//     if (error) {
//       console.error('Error fetching areas:', error);
//       return;
//     }

//     setAreas(data || []);
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const formData = new FormData(e.currentTarget);
      
//       // Get current user
//       const { data: { user }, error: userError } = await supabase.auth.getUser();
//       if (userError || !user) throw new Error('User not authenticated');

//       // Get user's profile
//       const { data: profile, error: profileError } = await supabase
//         .from('profiles')
//         .select('email, full_name')
//         .eq('id', user.id)
//         .single();
//       if (profileError) throw profileError;

//       // Insert garden task
//       const { data: newTask, error: insertError } = await supabase
//         .from('garden_tasks')
//         .insert({
//           title: formData.get('title') as string,
//           description: formData.get('description') as string,
//           area_id: formData.get('area_id') as string,
//           priority: formData.get('priority') as GardenTaskPriority,
//           due_date: (formData.get('due_date') as string) || null,
//           scheduled_time: (formData.get('scheduled_time') as string) || null,
//           assigned_to: (formData.get('assigned_to') as string) || 'Everyone',
//           status: 'pending'
//         })
//         .select()
//         .single();

//       if (insertError) throw insertError;

//       // Create calendar event if due date is set
//       if (formData.get('due_date') && newTask) {
//         await createGardenTaskEvent(
//           newTask.title,
//           newTask.description,
//           newTask.due_date,
//           newTask.scheduled_time,
//           user.id,
//           profile.full_name,
//           newTask.id
//         );
//       }

//       router.refresh();
//       setIsOpen(false);
//     } catch (error) {
//       console.error('Error creating task:', error);
//       setError(
//         error instanceof Error ? error.message : 'Failed to create task'
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <Button
//         onClick={() => {
//           setIsOpen(true);
//           fetchAreas();
//         }}
//         variant="default"
//       >
//         <Plus className="h-4 w-4 mr-2" />
//         Add Task
//       </Button>

//       <Dialog open={isOpen} onOpenChange={setIsOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>New Garden Task</DialogTitle>
//           </DialogHeader>

//           {error && (
//             <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-3 rounded-md text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="title">Title</Label>
//               <Input
//                 id="title"
//                 name="title"
//                 required
//                 placeholder="Enter task title"
//               />
//             </div>

//             <div>
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 name="description"
//                 required
//                 placeholder="Enter task description"
//                 className="min-h-[100px] "
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="area_id">Area</Label>
//                 <select
//                   id="area_id"
//                   name="area_id"
//                   required
//                   className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
//                 >
//                   <option value="">Select an area</option>
//                   {areas.map((area) => (
//                     <option key={area.id} value={area.id}>
//                       {area.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <Label htmlFor="priority">Priority</Label>
//                 <select
//                   id="priority"
//                   name="priority"
//                   required
//                   defaultValue="medium"
//                   className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
//                 >
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                   <option value="urgent">Urgent</option>
//                 </select>
//               </div>

//               <div>
//                 <Label htmlFor="assigned_to">Assigned To</Label>
//                 <Input
//                   id="assigned_to"
//                   name="assigned_to"
//                   placeholder="Enter any name"
//                   defaultValue="Everyone"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="due_date">Date</Label>
//                 <Input type="date" id="due_date" name="due_date" />
//               </div>

//               <div>
//                 <Label htmlFor="scheduled_time">Time</Label>
//                 <Input type="time" id="scheduled_time" name="scheduled_time" />
//               </div>
//             </div>

//             <div className="flex justify-end space-x-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setIsOpen(false)}
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isSubmitting}>
//                 {isSubmitting ? 'Creating...' : 'Create Task'}
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }


// app/(default)/garden/new-garden-task-modal.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GardenTaskPriority } from '@/types/garden';
import { Plus } from 'lucide-react';
import { createGardenTaskEvent } from '@/lib/actions/calendar';

export default function NewGardenTaskModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const supabase = createClientComponentClient();

  const fetchAreas = async () => {
    const { data, error } = await supabase
      .from('garden_areas')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching areas:', error);
      return;
    }

    setAreas(data || []);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      // Prepare duration
      const durationValue = formData.get('duration') as string;
      let durationInterval: string | null = null;
      if (durationValue) {
        if (durationValue === '24') {
          durationInterval = '24 hours';
        } else {
          durationInterval = `${durationValue} hours`;
        }
      }

      // Insert garden task
      const { data: newTask, error: insertError } = await supabase
        .from('garden_tasks')
        .insert({
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          area_id: formData.get('area_id') as string,
          priority: formData.get('priority') as GardenTaskPriority,
          due_date: (formData.get('due_date') as string) || null,
          scheduled_time: (formData.get('scheduled_time') as string) || null,
          assigned_to: (formData.get('assigned_to') as string) || 'Everyone',
          status: 'pending',
          duration: durationInterval,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create calendar event if due date is set
      if (formData.get('due_date') && newTask) {
        await createGardenTaskEvent(
          newTask.title,
          newTask.description,
          newTask.due_date,
          newTask.scheduled_time,
          durationValue,
          user.id,
          profile.full_name,
          newTask.id
        );
      }

      router.refresh();
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create task'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
          fetchAreas();
        }}
        variant="default"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Task
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Garden Task</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Enter task description"
                className="min-h-[100px] "
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area_id">Area</Label>
                <select
                  id="area_id"
                  name="area_id"
                  required
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
                >
                  <option value="">Select an area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  name="priority"
                  required
                  defaultValue="medium"
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Input
                  id="assigned_to"
                  name="assigned_to"
                  placeholder="Enter any name"
                  defaultValue="Everyone"
                />
              </div>

              <div>
                <Label htmlFor="due_date">Date</Label>
                <Input type="date" id="due_date" name="due_date" />
              </div>

              <div>
                <Label htmlFor="scheduled_time">Time</Label>
                <Input type="time" id="scheduled_time" name="scheduled_time" />
              </div>

              {/* Duration Field */}
              <div>
                <Label htmlFor="duration">Duration</Label>
                <select
                  id="duration"
                  name="duration"
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
                >
                  <option value="">Select duration</option>
                  <option value="0.5">Half an hour</option>
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="24">All day</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
