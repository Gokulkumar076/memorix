import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-void-radial opacity-50 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center"
      >
        <p className="text-7xl font-display font-medium text-gradient-synapse mb-4">404</p>
        <h1 className="text-xl font-display font-medium mb-2">This card doesn't exist</h1>
        <p className="text-sm text-void-400 mb-8 max-w-sm">
          Looks like this page decayed past recall. Let's get you back somewhere useful.
        </p>
        <Link to="/">
          <Button>
            <Home className="h-4 w-4" />
            Back home
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
