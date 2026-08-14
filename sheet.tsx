'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const SheetContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

export const Sheet = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => (
  <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>
)

export const SheetTrigger = ({ children, asChild = true }: { children: React.ReactNode; asChild?: boolean }) => {
  const { onOpenChange } = React.useContext(SheetContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
    })
  }
  return <button onClick={() => onOpenChange(true)}>{children}</button>
}

export const SheetContent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const { open, onOpenChange } = React.useContext(SheetContext)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
          {/* Content */}
          <div
            className={cn('fixed right-0 top-0 h-full w-full max-w-md transform-gpu transition-transform duration-300 ease-in-out', open ? 'translate-x-0' : 'translate-x-full', className)}
          >
            {children}
          </div>
        </div>
      )}
    </>
  )
}