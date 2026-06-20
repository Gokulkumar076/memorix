import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/AppShell'
import { useAuthStore } from '@/stores/authStore'
import { useCurrentUser } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui/Loaders'

import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import DecksPage from '@/pages/DecksPage'
import DeckDetailPage from '@/pages/DeckDetailPage'
import StudyPage from '@/pages/StudyPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Lazy-loaded: pull in heavy 3D/chart vendor chunks only when visited
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))

function AuthBootstrap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  useCurrentUser()
  useEffect(() => {
    if (isAuthenticated) {
      document.documentElement.classList.add('dark')
    }
  }, [isAuthenticated])
  return null
}

export default function App() {
  return (
    <>
      <AuthBootstrap />
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks"
          element={
            <ProtectedRoute>
              <AppShell>
                <DecksPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/:deckId"
          element={
            <ProtectedRoute>
              <AppShell>
                <DeckDetailPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/:deckId/study"
          element={
            <ProtectedRoute>
              <StudyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppShell>
                <AnalyticsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppShell>
                <SettingsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
