import { create } from 'zustand'
import type { AuthResponse, UserProfileResponse } from '../types/auth.types'
import { getStorageAdapter } from '../platform/storage'
import { authApi } from '../api/auth.api'
import { clearAccessToken, setAccessToken } from '../session'

const REFRESH_TOKEN_KEY = 'refreshToken'

interface AuthState {
  user: UserProfileResponse | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  initialize(): Promise<void>
  login(authResponse: AuthResponse): Promise<void>
  logout(): Promise<void>
  refreshTokens(): Promise<void>
  setUser(user: UserProfileResponse): void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const storage = getStorageAdapter()
    const storedRefreshToken = await storage.getItem(REFRESH_TOKEN_KEY)

    if (!storedRefreshToken) {
      set({ isLoading: false })
      return
    }

    try {
      const response = await authApi.refresh(storedRefreshToken)
      setAccessToken(response.accessToken)
      set({
        accessToken: response.accessToken,
        refreshToken: storedRefreshToken,
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      await storage.removeItem(REFRESH_TOKEN_KEY)
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  login: async (authResponse) => {
    const storage = getStorageAdapter()

    setAccessToken(authResponse.accessToken)

    set({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      user: authResponse.user,
      isAuthenticated: true,
      isLoading: false,
    })

    if (authResponse.refreshToken) {
      await storage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken)
    }
  },

  logout: async () => {
    const storage = getStorageAdapter()
    const { refreshToken } = get()

    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => undefined)
    }

    await storage.removeItem(REFRESH_TOKEN_KEY)
    clearAccessToken()
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  refreshTokens: async () => {
    const { refreshToken } = get()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await authApi.refresh(refreshToken)
    setAccessToken(response.accessToken)
    set({
      accessToken: response.accessToken,
      user: response.user,
      isAuthenticated: true,
    })
  },

  setUser: (user) => set({ user }),
}))
