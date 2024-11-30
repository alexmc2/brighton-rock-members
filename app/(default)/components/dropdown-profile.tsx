// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { Menu, Transition } from '@headlessui/react';
// import UserAvatar from '@/public/images/user-avatar-32.png';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// export default function DropdownProfile({
//   align,
// }: {
//   align?: 'left' | 'right';
// }) {
//   const router = useRouter();
//   const supabase = createClientComponentClient();
//   const [userEmail, setUserEmail] = useState<string | null>(null);
//   const [userName, setUserName] = useState<string | null>(null);

//   useEffect(() => {
//     const getUser = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       setUserEmail(user?.email ?? null);

//       if (user) {
//         // Fetch the user's profile
//         const { data: profile } = await supabase
//           .from('profiles')
//           .select('full_name')
//           .eq('id', user.id)
//           .single();

//         setUserName(profile?.full_name ?? null);
//       }
//     };
//     getUser();
//   }, [supabase]);

//   const handleSignOut = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     try {
//       console.log('Signing out...');
//       const { error } = await supabase.auth.signOut();
//       if (error) {
//         console.error('Error signing out:', error);
//         return;
//       }
//       console.log('Sign out successful');
//       router.refresh();
//       router.push('/login');
//     } catch (error) {
//       console.error('Unexpected error during sign out:', error);
//     }
//   };

//   return (
//     <Menu as="div" className="relative inline-flex">
//       <Menu.Button className="inline-flex justify-center items-center group">
//         <Image
//           className="w-8 h-8 rounded-full"
//           src={UserAvatar}
//           width={32}
//           height={32}
//           alt="User"
//         />
//         <div className="flex items-center truncate">
//           <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
//             {userName || userEmail || 'Loading...'}
//           </span>
//           <svg
//             className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500"
//             viewBox="0 0 12 12"
//           >
//             <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
//           </svg>
//         </div>
//       </Menu.Button>
//       <Transition
//         as="div"
//         className={`origin-top-right z-10 absolute top-full min-w-[11rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${
//           align === 'right' ? 'right-0' : 'left-0'
//         }`}
//         enter="transition ease-out duration-200 transform"
//         enterFrom="opacity-0 -translate-y-2"
//         enterTo="opacity-100 translate-y-0"
//         leave="transition ease-out duration-200"
//         leaveFrom="opacity-100"
//         leaveTo="opacity-0"
//       >
//         <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
//           <div className="font-medium text-gray-800 dark:text-gray-100">
//             {userName || userEmail}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400 italic">
//             Member
//           </div>
//         </div>
//         <Menu.Items static className="focus:outline-none">
//           <Menu.Item>
//             {({ active }) => (
//               <Link
//                 className={`font-medium text-sm flex items-center py-1 px-3 ${
//                   active ? 'text-coop-600 dark:text-coop-400' : 'text-coop-500'
//                 }`}
//                 href="/settings"
//               >
//                 Settings
//               </Link>
//             )}
//           </Menu.Item>
//           <Menu.Item>
//             {({ active }) => (
//               <a
//                 href="#"
//                 onClick={handleSignOut}
//                 className={`font-medium text-sm flex w-full items-center py-1 px-3 ${
//                   active ? 'text-coop-600 dark:text-coop-400' : 'text-coop-500'
//                 }`}
//               >
//                 Sign Out
//               </a>
//             )}
//           </Menu.Item>
//         </Menu.Items>
//       </Transition>
//     </Menu>
//   );
// }
