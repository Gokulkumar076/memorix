import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useRegister } from '@/hooks/useAuth'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', displayName: '' })
  const register = useRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({
      email: form.email,
      username: form.username,
      password: form.password,
      display_name: form.displayName || undefined,
    })
  }

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-synapse opacity-50 pointer-events-none" />

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
          <h1 className="text-xl font-display font-medium text-center mb-1">Create your account</h1>
          <p className="text-sm text-ink-400 text-center mb-7">Start building decks that actually stick</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Display name"
              placeholder="Ada Lovelace"
              value={form.displayName}
              onChange={update('displayName')}
              autoComplete="name"
            />
            <Input
              label="Username"
              placeholder="ada"
              value={form.username}
              onChange={update('username')}
              required
              minLength={3}
              autoComplete="username"
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={update('password')}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full" isLoading={register.isPending}>
              <UserPlus className="h-4 w-4" />
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-synapse-300 font-medium hover:text-synapse-200">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
