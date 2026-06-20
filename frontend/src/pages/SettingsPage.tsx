import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Moon, Sun, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { authApi } from '@/api/auth'
import { getApiErrorMessage } from '@/api/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { clearAllCache } from '@/lib/db'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const queryClient = useQueryClient()

  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [dailyGoal, setDailyGoal] = useState(user?.daily_goal ?? 20)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data } = await authApi.updateProfile({ display_name: displayName, daily_goal: dailyGoal })
      setUser(data)
      toast.success('Settings saved')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearCache = async () => {
    await clearAllCache()
    queryClient.invalidateQueries()
    toast.success('Offline cache cleared')
  }

  return (
    <div className="space-y-7 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="label-eyebrow mb-1.5">Account</p>
        <h1 className="text-2xl sm:text-3xl font-display font-medium">Settings</h1>
      </motion.div>

      <Card>
        <h3 className="font-display text-base font-medium mb-5">Profile</h3>
        <div className="space-y-4">
          <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input label="Username" value={user?.username || ''} disabled />
          <Input label="Email" value={user?.email || ''} disabled />
          <Input
            label="Daily review goal"
            type="number"
            min={1}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
          />
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-base font-medium mb-5">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-100">Theme</p>
            <p className="text-xs text-ink-400">Switch between dark and light mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-xl glass-bright px-4 py-2 text-sm font-medium"
          >
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-base font-medium mb-5">Offline data</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-100">Clear local cache</p>
            <p className="text-xs text-ink-400">Removes cached decks and cards stored for offline study</p>
          </div>
          <Button variant="secondary" onClick={handleClearCache}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-base font-medium mb-2">Stats</h3>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-2xl font-display text-ink-50">{user?.level ?? 1}</p>
            <p className="text-xs text-ink-500">Level</p>
          </div>
          <div>
            <p className="text-2xl font-display text-ink-50">{user?.streak ?? 0}</p>
            <p className="text-xs text-ink-500">Current streak</p>
          </div>
          <div>
            <p className="text-2xl font-display text-ink-50">{user?.longest_streak ?? 0}</p>
            <p className="text-xs text-ink-500">Longest streak</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
