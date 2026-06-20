import { type ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

const variants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
}

export function Reveal({ children, className, delay = 0, y = 32, once = true }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Staggers children entrance — wrap a list/grid in this, no per-item config needed */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={variants} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  )
}
