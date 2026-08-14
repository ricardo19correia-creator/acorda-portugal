'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type SheetContextType = {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextType | null>(null)

function useSheet() {
  const context = React.useContext(SheetContext)

  if (!context) {
    throw new Error('Sheet components must be used inside <Sheet>.')
  }

  return context
}

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sheet({
  children,
  open: controlledOpen,
  onOpenChange,
}: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)

  const open = controlledOpen ?? internalOpen

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(value)
      }

      onOpenChange?.(value)
    },
    [controlledOpen, onOpenChange],
  )

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function SheetTrigger({
  children,
  onClick,
  ...props
}: SheetTriggerProps) {
  const { setOpen } = useSheet()

  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(true)
        }
      }}
    >
      {children}
    </button>
  )
}

interface SheetContentProps {
  children: React.ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
}

export function SheetContent({
  children,
  side = 'right',
  className,
}: SheetContentProps) {
  const { open, setOpen } = useSheet()

  if (!open) {
    return null
  }

  const sideClasses = {
    left: 'left-0 top-0 h-full w-[min(420px,90vw)] border-r',
    right: 'right-0 top-0 h-full w-[min(420px,90vw)] border-l',
    top: 'left-0 top-0 w-full border-b',
    bottom: 'left-0 bottom-0 w-full border-t',
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed z-50 flex max-h-screen flex-col overflow-y-auto border-white/10 bg-background p-6 shadow-2xl',
          sideClasses[side],
          className,
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 rounded-lg px-2 py-1 text-xl text-muted-foreground transition hover:bg-white/10 hover:text-white"
          aria-label="Fechar"
        >
          ×
        </button>

        {children}
      </div>
    </>
  )
}