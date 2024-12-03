'use client'

import * as React from 'react'
import { Presence } from '@radix-ui/react-presence'
import { cn } from '@/lib/utils'

interface TransitionProps {
  show?: boolean
  children: React.ReactNode
  className?: string
}

const Transition = React.forwardRef<
  HTMLDivElement,
  TransitionProps
>(({ show = true, children, className }, ref) => (
  <Presence present={show}>
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  </Presence>
))
Transition.displayName = "Transition"

export { Transition } 