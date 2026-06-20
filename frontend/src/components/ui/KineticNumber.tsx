import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface KineticNumberProps {
  value: number
  className?: string
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
}

/**
 * Numbers in Memorix ARE the content (intervals, XP, streaks, retention %) —
 * so they count up into place with spring physics rather than appearing flat.
 */
export function KineticNumber({
  value,
  className,
  duration = 1.2,
  suffix = '',
  prefix = '',
  decimals = 0,
}: KineticNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0.15 })
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, value, motionValue])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + latest.toFixed(decimals) + suffix
      }
    })
  }, [springValue, prefix, suffix, decimals])

  return (
    <motion.span ref={ref} className={cn('stat-numeral', className)}>
      {prefix}0{suffix}
    </motion.span>
  )
}
