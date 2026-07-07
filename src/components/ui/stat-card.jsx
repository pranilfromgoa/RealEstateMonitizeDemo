import { cn } from '@/lib/utils'

export function StatCard({ label, source, value, sub, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-sky-50 text-sky-600',
    amber:  'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    indigo:  'bg-sky-50 text-sky-600',
    violet:  'bg-sky-50 text-sky-600',
  }

  return (
    <div className="ds-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="ds-stat-label min-h-[2.25rem] flex items-start">{label}</p>
          <p className="ds-stat-value">{value}</p>
          {sub && <p className="ds-caption mt-0.5">{sub}</p>}
          {trend !== undefined && (
            <p className={cn('mt-1 text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2 rounded-lg', colorMap[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  )
}
