import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Layers, BarChart3, Settings, LogOut,
  Flame, Sparkles, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/decks', label: 'Decks', icon: Layers },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()
  const { isOnline } = useOfflineSync()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/[0.06] glass !rounded-none p-5">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 mb-8 px-1"
        >
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-synapse-500 to-recall-500 flex items-center justify-center shadow-glow-synapse">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Memorix</span>
        </button>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-synapse-500/15 text-synapse-300 shadow-inner-glass'
                    : 'text-ink-300 hover:text-ink-50 hover:bg-white/5'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 pt-4 border-t border-white/[0.06]">
          {!isOnline && (
            <div className="flex items-center gap-2 rounded-lg bg-decay-500/10 border border-decay-500/20 px-3 py-2 text-xs text-decay-300">
              <span className="h-1.5 w-1.5 rounded-full bg-decay-400 animate-pulse" />
              Offline mode
            </div>
          )}

          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center gap-1 rounded-lg bg-decay-500/10 px-2 py-1 text-xs font-mono text-decay-300">
              <Flame className="h-3 w-3" />
              {user?.streak ?? 0}
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-synapse-500/10 px-2 py-1 text-xs font-mono text-synapse-300">
              Lv.{user?.level ?? 1}
            </div>
          </div>

          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-left hover:bg-white/5 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-synapse-400 to-recall-400 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {(user?.display_name || user?.username || '?')[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-50 truncate">{user?.display_name || user?.username}</p>
              <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full rounded-xl px-3.5 py-2 text-sm font-medium text-ink-400 hover:text-decay-300 hover:bg-decay-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between glass !rounded-none px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-synapse-500 to-recall-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display text-base font-semibold">Memorix</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-ink-200">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden fixed top-[57px] inset-x-0 z-30 glass-bright !rounded-none p-4 space-y-1"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium',
                  isActive ? 'bg-synapse-500/15 text-synapse-300' : 'text-ink-300'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full rounded-xl px-3.5 py-3 text-sm font-medium text-decay-300"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </motion.div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">{children}</div>
      </main>
    </div>
  )
}
