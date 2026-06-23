import { cn } from '@/lib/utils'

const variantStyles = {
  default:     'bg-sky-100 text-sky-800',
  success:     'bg-white border border-gray-200 text-gray-700',
  warning:     'bg-white border border-gray-200 text-gray-700',
  destructive: 'bg-white border border-gray-200 text-gray-700',
  secondary:   'bg-secondary text-secondary-foreground',
  outline:     'border border-border text-foreground bg-transparent',
}

const variantDot = {
  success:     'bg-green-500',
  warning:     'bg-amber-400',
  destructive: 'bg-red-400',
}

export function Badge({ children, variant = 'default', className }) {
  const dot = variantDot[variant]
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', variantStyles[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />}
      {children}
    </span>
  )
}
