import { cn } from '@/lib/utils'

export function StatCard({ label, value, sub, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber:  'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    indigo:  'bg-indigo-50 text-indigo-600',
    violet:  'bg-violet-50 text-violet-600',
  }

  return (
    <div className="ds-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="ds-stat-label">{label}</p>
          <p className="ds-stat-value mt-1">{value}</p>
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
