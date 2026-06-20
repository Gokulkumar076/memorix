import { type ReactNode, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}

/**
 * Wraps any element so it subtly "pulls" toward the cursor on hover —
 * a tactile, physical-feeling micro-interaction rather than a flat hover state.
 */
export function Magnetic({ children, className, strength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    setOffset({ x, y })
  }

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 })

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.4 }}
    >
      {children}
    </motion.div>
  )
}
