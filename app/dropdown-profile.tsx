// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Button } from '@/components/ui/button';
// import UserAvatar from '@/public/images/user-avatar-32.png';

// interface DropdownProfileProps {
//   align?: 'right' | 'left';
// }

// export default function DropdownProfile({
//   align = 'right',
// }: DropdownProfileProps) {
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
      
//       if (user?.id) {
//         const { data: profile } = await supabase
//           .from('profiles')
//           .select('full_name')
//           .eq('id', user.id)
//           .single();
//         setUserName(profile?.full_name ?? user.email?.split('@')[0] ?? 'User');
//       }
//     };
//     getUser();
//   }, [supabase.auth]);

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
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//           <Image
//             className="rounded-full"
//             src={UserAvatar}
//             width={32}
//             height={32}
//             alt="User avatar"
//           />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-56" align={align} forceMount>
//         <div className="flex items-center justify-start gap-2 p-2">
//           <div className="flex flex-col space-y-1 leading-none">
//             {userName && (
//               <p className="font-medium">{userName}</p>
//             )}
//             {userEmail && (
//               <p className="w-[200px] truncate text-sm text-muted-foreground">
//                 {userEmail}
//               </p>
//             )}
//           </div>
//         </div>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem asChild>
//           <Link href="/settings">Settings</Link>
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
