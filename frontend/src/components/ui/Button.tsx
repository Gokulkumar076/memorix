import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'mint'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'> | 'children'>,
    Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  children?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-synapse-500 text-white shadow-glow-synapse hover:bg-synapse-400 hover:shadow-glow-synapse-lg',
  secondary: 'glass-bright text-ghost hover:bg-void-600/70',
  ghost: 'text-void-300 hover:text-ghost hover:bg-white/5',
  danger: 'bg-decay-500 text-white shadow-glow-decay hover:bg-decay-400',
  mint: 'bg-mint-500 text-void-950 shadow-glow-mint hover:bg-mint-400',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
  xl: 'px-9 py-4.5 text-lg rounded-2xl gap-3 font-display',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2, scale: 1.015 }}
        whileTap={{ scale: 0.96, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-colors duration-200',
          'disabled:opacity-40 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
