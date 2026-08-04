import apiClient from './client'
import type { AuthResponse, UserProfileResponse } from '../types/auth.types'

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((response) => response.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((response) => response.data),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }).then((response) => response.data),

  logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),

  verifyEmail: (token: string) =>
    apiClient.post<AuthResponse>('/auth/verify-email', { token }).then((response) => response.data),

  resendVerification: (email: string) => apiClient.post('/auth/resend-verification', { email }),

  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    apiClient.post('/auth/reset-password', data),

  getProfile: () =>
    apiClient.get<UserProfileResponse>('/users/me').then((response) => response.data),
}
