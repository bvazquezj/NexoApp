import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authApi } from '../../../api/auth.api'
import { useAuthStore } from '../../../stores/useAuthStore'
import { AuthLayout } from '../components/AuthLayout'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNeedsVerification(false)
    setIsLoading(true)

    try {
      const response = await authApi.login({ email, password })
      login(response)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const errorCode = err.response?.data?.error ?? ''
        const message = err.response?.data?.message ?? ''

        if (status === 401) {
          setError('Credenciales incorrectas')
        } else if (status === 403 && errorCode === 'EMAIL_NOT_VERIFIED') {
          setNeedsVerification(true)
        } else {
          setError(message || 'Ocurrió un error. Intenta de nuevo.')
        }
      } else {
        setError('Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Bienvenido de nuevo a tu centro de operaciones.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="field-input"
            placeholder="tucorreo@nexo.app"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="field-label mb-0">
              Contraseña
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="field-input pr-16"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        {needsVerification && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
            Debes verificar tu email.{' '}
            <Link to="/verify-email/pending" className="font-semibold underline">
              Reenviar verificación
            </Link>
          </p>
        )}

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />}
          Iniciar sesión
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  )
}
