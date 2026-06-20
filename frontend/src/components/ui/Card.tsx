import { type HTMLAttributes, forwardRef, useRef, useState } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<'div'>>, HTMLMotionProps<'div'> {
  hover?: boolean
  bright?: boolean
  tilt?: boolean
  glow?: 'synapse' | 'recall' | 'decay' | 'mint'
}

const glowShadow: Record<NonNullable<CardProps['glow']>, string> = {
  synapse: 'hover:shadow-glow-synapse',
  recall: 'hover:shadow-glow-recall',
  decay: 'hover:shadow-glow-decay',
  mint: 'hover:shadow-glow-mint',
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') {
        ref(node)
      } else {
        ;(ref as React.MutableRefObject<T | null>).current = node
      }
    }
  }
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, bright = false, tilt = false, glow = 'synapse', children, onMouseMove, onMouseLeave, ...props }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null)
    const [transform, setTransform] = useState('')

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (tilt && innerRef.current) {
        const rect = innerRef.current.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width - 0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5
        setTransform(`perspective(800px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateZ(4px)`)
      }
    }

    const handleMouseLeave = () => {
      if (tilt) setTransform('perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)')
    }

    return (
      <motion.div
        ref={mergeRefs(innerRef, ref)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={tilt ? { transform, transition: 'transform 0.15s ease-out' } : undefined}
        className={cn(
          bright ? 'glass-bright' : 'glass',
          'rounded-2xl p-6',
          hover && cn(
            'transition-all duration-300 ease-snap hover:border-white/[0.16] hover:-translate-y-1 cursor-pointer',
            glowShadow[glow]
          ),
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
