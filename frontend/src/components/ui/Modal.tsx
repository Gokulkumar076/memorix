import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
      window.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleEsc)
      }
    }
  }, [isOpen, onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-void-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            className={cn(
              'relative w-full glass-bright rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-glow-synapse',
              sizeClasses[size]
            )}
          >
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-medium text-ghost">{title}</h3>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-void-300 hover:text-ghost hover:bg-white/5 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
