import { type HTMLAttributes, forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<'div'>>, HTMLMotionProps<'div'> {
  hover?: boolean
  bright?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, bright = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          bright ? 'glass-bright' : 'glass',
          'rounded-2xl p-6',
          hover && 'transition-all duration-300 hover:border-white/[0.16] hover:-translate-y-0.5 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'
