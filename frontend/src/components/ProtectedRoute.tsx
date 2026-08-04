import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (user && !user.emailVerified) return <Navigate to="/verify-email/pending" replace />

  return <>{children}</>
}
