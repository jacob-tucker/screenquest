import { cn } from '@/lib/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        {
          'bg-zinc-700 text-zinc-300': variant === 'default',
          'bg-emerald-500/10 text-emerald-400': variant === 'success',
          'bg-amber-500/10 text-amber-400': variant === 'warning',
          'bg-red-500/10 text-red-400': variant === 'error',
        },
        className
      )}
      {...props}
    />
  )
}

export function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const variants = {
    pending: { variant: 'warning' as const, label: 'In Review' },
    approved: { variant: 'success' as const, label: 'Approved' },
    rejected: { variant: 'error' as const, label: 'Rejected' },
  }

  const { variant, label } = variants[status]

  return <Badge variant={variant}>{label}</Badge>
}
