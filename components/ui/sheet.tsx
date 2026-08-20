'use client'

import * as React from 'react'
import { X } from 'lucide-react'
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
  asChild,
  ...props
}: SheetTriggerProps) {
  const { setOpen } = useSheet()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(true)
    }
  }

  if (asChild && React.isValidElement<React.ButtonHTMLAttributes<HTMLButtonElement>>(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        children.props.onClick?.(event)
        handleClick(event)
      },
    })
  }

  return (
    <button
      type="button"
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

interface SheetContentProps {
  children: React.ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom' | 'center'
  className?: string
}

export function SheetContent({
  children,
  side = 'center',
  className,
}: SheetContentProps) {
  const { open, setOpen } = useSheet()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, setOpen])

  if (!open) {
    return null
  }

  if (side === 'center') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        {/* Dark Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />

        {/* Centered Modal Dialog */}
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative z-10 w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-4xl border border-white/15 bg-card/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl animate-scale-in flex flex-col',
            className,
          )}
        >
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-5 top-5 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          {children}
        </div>
      </div>
    )
  }

  const sideClasses = {
    left: 'left-0 top-0 h-full w-[min(420px,90vw)] border-r',
    right: 'right-0 top-0 h-full w-[min(420px,90vw)] border-l',
    top: 'left-0 top-0 w-full border-b',
    bottom: 'left-0 bottom-0 w-full border-t',
    center: '',
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
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
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-muted-foreground transition hover:bg-white/20 hover:text-white cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>
    </>
  )
}