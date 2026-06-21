import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLogin } from '@/hooks/useAuth'
import { AuroraField } from '@/components/webgl/AuroraField'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-void-950">
      <AuroraField className="absolute inset-0 h-full w-full opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-sm"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-synapse-500 to-recall-500 flex items-center justify-center shadow-glow-synapse">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Memorix</span>
        </Link>

        <div className="glass-card p-7 sm:p-8">
          <h1 className="text-xl font-display font-medium text-center mb-1">Welcome back</h1>
          <p className="text-sm text-void-400 text-center mb-7">Sign in to continue your streak</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" isLoading={login.isPending}>
              <Lock className="h-4 w-4" />
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-void-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-synapse-300 font-medium hover:text-synapse-200">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
