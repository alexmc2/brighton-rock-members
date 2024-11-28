'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center rounded-sm px-3 py-2 text-slate-200 hover:text-white hover:bg-slate-700 transition duration-150"
    >
      <svg className="w-4 h-4 shrink-0 fill-current text-slate-400 mr-3" viewBox="0 0 24 24">
        <path d="M16 13v-2H7V8l-5 4 5 4v-3z" />
        <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z" />
      </svg>
      <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
        Sign Out
      </span>
    </button>
  )
} 