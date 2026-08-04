import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { authApi } from '../../../api/auth.api'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsLoading(true)

    try {
      await authApi.resetPassword({ token, newPassword })
      setSuccess(true)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        if (status === 400) {
          setError('El link de restablecimiento expiró o ya fue usado.')
        } else {
          setError(err.response?.data?.message ?? 'Ocurrió un error. Intenta de nuevo.')
        }
      } else {
        setError('Ocurrió un error. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta.">
        <div className="flex flex-col items-center rounded-xl2 border border-slate-200 bg-white px-6 py-10 text-center shadow-soft">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-50/60">
            <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-5 font-display text-lg font-semibold text-ink-900">Contraseña restablecida</p>
          <p className="mt-1 text-sm text-slate-500">Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <Link to="/login" className="btn-primary mt-6 w-full">
            Iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="newPassword" className="field-label">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="field-input pr-16"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
              aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showNewPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          <PasswordStrengthIndicator password={newPassword} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="field-label">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="field-input pr-16"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirmPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />}
          Restablecer contraseña
        </button>
      </form>
    </AuthLayout>
  )
}
