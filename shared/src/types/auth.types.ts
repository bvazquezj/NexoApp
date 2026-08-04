export interface UserProfileResponse {
  id: string
  name: string
  email: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  accessToken: string | null
  refreshToken: string | null
  expiresIn: number | null
  user: UserProfileResponse | null
  requiresVerification: boolean | null
  message: string | null
}
