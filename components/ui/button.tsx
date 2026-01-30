import { cn } from '@/lib/utils/cn'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-emerald-600 text-white hover:bg-emerald-500': variant === 'primary',
            'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700': variant === 'secondary',
            'text-zinc-400 hover:text-white hover:bg-zinc-800': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-500': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
