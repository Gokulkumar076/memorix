import { api } from './client'
import type { AuthTokens, User } from '@/types'

export interface RegisterPayload {
  email: string
  username: string
  password: string
  display_name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (data: RegisterPayload) => api.post<User>('/api/auth/register', data),
  login: (data: LoginPayload) => api.post<AuthTokens>('/api/auth/login', data),
  me: () => api.get<User>('/api/auth/me'),
  updateProfile: (data: Partial<Pick<User, 'display_name' | 'avatar_url' | 'daily_goal'>>) =>
    api.patch<User>('/api/users/me', data),
}
