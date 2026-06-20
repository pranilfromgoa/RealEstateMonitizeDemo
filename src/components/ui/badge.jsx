import { cn } from '@/lib/utils'

const variantStyles = {
  default:     'bg-sky-100 text-sky-800',
  success:     'bg-green-100 text-green-800',
  warning:     'bg-yellow-100 text-yellow-800',
  destructive: 'bg-red-100 text-red-800',
  secondary:   'bg-secondary text-secondary-foreground',
  outline:     'border border-border text-foreground bg-transparent',
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variantStyles[variant], className)}>
      {children}
    </span>
  )
}
