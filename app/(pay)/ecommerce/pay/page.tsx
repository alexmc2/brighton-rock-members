// export const metadata = {
//   title: 'Pay - Mosaic',
//   description: 'Page description',
// }

// import Link from 'next/link'
// import PayForm from './pay-form'
// import Logo from '@/components/ui/logo'

// export default function Pay() {
//   return (
//     <>
//       <header className="bg-white dark:bg-gray-900">
//         <div className="px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16 lg:border-b border-gray-200 dark:border-gray-700/60">

//             {/* Logo */}
//             <Logo />

//             <Link className="block rounded-fullbg-gray-400/20 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" href="/ecommerce/cart">
//               <span className="sr-only">Back</span>
//               <svg width="32" height="32" viewBox="0 0 32 32">
//                 <path className="fill-current" d="M15.95 14.536l4.242-4.243a1 1 0 111.415 1.414l-4.243 4.243 4.243 4.242a1 1 0 11-1.415 1.415l-4.242-4.243-4.243 4.243a1 1 0 01-1.414-1.415l4.243-4.242-4.243-4.243a1 1 0 011.414-1.414l4.243 4.243z" />
//               </svg>
//             </Link>

//           </div>
//         </div>
//       </header>

//       <PayForm />
//     </>
//   )
// }

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from '@/components/ui/dropdown-menu';

const ColorSample = () => {
  return (
    <div className="p-8 space-y-4 dark:bg-slate-800 rounded-lg">
      <h1 className="text-white text-xl">New Maintenance Job</h1>

      <div className="space-y-2">
        <label className="block text-slate-400">Title</label>
        <input
          type="text"
          className="w-full p-2 bg-slate-700 rounded text-white"
          placeholder="Enter title"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-slate-400">Description</label>
        <textarea
          className="w-full p-2 bg-slate-800 rounded text-white"
          placeholder="Enter description"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-slate-400">Status</label>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full p-2 bg-slate-700 rounded text-white flex justify-between items-center">
            <span>Select Status</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[200px] bg-slate-700">
            <DropdownMenuItem className="text-white hover:bg-slate-600 cursor-pointer">
              Open
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-slate-600 cursor-pointer">
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-slate-600 cursor-pointer">
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white hover:bg-slate-600 cursor-pointer">
              On Hold
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="space-y-2">
        <label className="block text-slate-400">Priority</label>
        <select className="w-full p-2 bg-slate-800 rounded text-white">
          <option>Medium</option>
        </select>
      </div>
    </div>
  );
};

export default ColorSample;
