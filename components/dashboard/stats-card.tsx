import { cn } from '@/lib/utils/cn'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; positive: boolean }
  className?: string
}

export function StatsCard({ label, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn('rounded-xl border border-zinc-800 bg-zinc-900 p-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs',
                trend.positive ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {trend.positive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
          <Icon className="h-5 w-5 text-emerald-500" />
        </div>
      </div>
    </div>
  )
}
