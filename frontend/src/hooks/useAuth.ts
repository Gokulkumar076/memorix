import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi, type LoginPayload, type RegisterPayload } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { getApiErrorMessage } from '@/api/client'

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setUser = useAuthStore((s) => s.setUser)

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await authApi.me()
      setUser(data)
      return data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async ({ data }) => {
      setTokens(data.access_token, data.refresh_token)
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      toast.success('Welcome back')
      navigate('/dashboard')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: () => {
      toast.success('Account created — please sign in')
      navigate('/login')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return () => {
    logout()
    queryClient.clear()
    navigate('/login')
  }
}
