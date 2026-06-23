import { type ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
}

/** Scroll-triggered reveal — replays every time element leaves and re-enters view */
export function Reveal({ children, className, delay = 0, y = 28, once = false }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Staggers children — also replays every scroll pass */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  once = false,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  once?: boolean
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
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
    <motion.div
      variants={itemVariants}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
