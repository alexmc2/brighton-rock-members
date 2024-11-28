'use client'

import { createContext, useContext, useState } from 'react'
import { AuthProvider } from '@/contexts/auth-context'

interface SidebarContextProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextProps>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
})

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AuthProvider>
      <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
        {children}
      </SidebarContext.Provider>
    </AuthProvider>
  )
}

export const useAppProvider = () => useContext(SidebarContext)