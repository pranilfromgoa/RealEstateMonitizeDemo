import { cn } from '@/lib/utils'

export function Progress({ value, max = 100, className, color = 'blue' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const colorMap = {
    blue:  'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red:   'bg-red-500',
  }
  return (
    <div className={cn('w-full bg-muted rounded-full h-2', className)}>
      <div className={cn('h-2 rounded-full transition-all', colorMap[color])} style={{ width: `${pct}%` }} />
    </div>
  )
}
