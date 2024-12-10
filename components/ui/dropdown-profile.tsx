'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getUserColor } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function DropdownProfile({
  align = 'end',
}: {
  align?: 'start' | 'end';
}) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
        setUserId(user.id);

        // Fetch the user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        setUserName(profile?.full_name || user.email.split('@')[0] || 'User');
      }
    };
    getUser();
  }, [supabase]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      router.refresh();
      router.push('/login');
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex justify-center items-center group">
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-full ${userId ? getUserColor(userId) : 'bg-gray-400'} flex items-center justify-center`}
          >
            <span className="text-sm font-medium text-white">
              {userName?.charAt(0).toUpperCase() ||
                userEmail?.charAt(0).toUpperCase() ||
                '?'}
            </span>
          </div>
        </div>
        <div className="flex items-center truncate">
          <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white transition-colors duration-150">
            {userName || 'Loading...'}
          </span>
          <svg
            className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500 transition-transform duration-150 group-data-[state=open]:rotate-180"
            viewBox="0 0 12 12"
          >
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={4}
        className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 p-0.5 duration-200"
      >
        <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
          <div className="font-medium text-gray-800 dark:text-gray-100">
            {userName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            {userEmail}
          </div>
        </div>
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="font-medium text-sm flex items-center py-1.5 px-3 text-gray-600 dark:text-gray-400 hover:bg-coop-500 hover:text-white dark:hover:bg-coop-500 dark:hover:text-white transition-all duration-200"
          >
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="font-medium text-sm w-full flex items-center py-1.5 px-3 text-gray-600 dark:text-gray-400 hover:bg-coop-500 hover:text-white dark:hover:bg-coop-500 dark:hover:text-white transition-all duration-200"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
