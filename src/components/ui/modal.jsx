import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

export function Modal({ open, onClose, title, children, size = 'md' }) {
  const panelRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Focus trap: keep Tab/Shift+Tab inside the modal
  useEffect(() => {
    if (!open || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    first?.focus()

    const trap = (e) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open])

  if (!open) return null

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative bg-popover text-popover-foreground border border-border',
          'rounded-2xl shadow-2xl w-full mx-4 max-h-[90vh] overflow-y-auto',
          sizeMap[size]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="ds-card-title" id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
