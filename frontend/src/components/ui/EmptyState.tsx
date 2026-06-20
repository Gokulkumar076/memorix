import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-20 px-6"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl glass text-synapse-300 shadow-glow-synapse">
        {icon}
      </div>
      <h3 className="text-lg font-display font-medium text-ghost mb-1.5">{title}</h3>
      <p className="text-sm text-void-300 max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  )
}
