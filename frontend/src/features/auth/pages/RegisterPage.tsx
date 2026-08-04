import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { authApi } from '../../../api/auth.api'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator'

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
  if (password.length > 100) return 'La contraseña no puede superar los 100 caracteres'
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir al menos una mayúscula'
  if (!/[0-9]/.test(password)) return 'La contraseña debe incluir al menos un número'
  return null
}

export function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)

    try {
      await authApi.register({ name, email, password })
      sessionStorage.setItem('pendingVerificationEmail', email)
      navigate(`/verify-email/pending?email=${encodeURIComponent(email)}`, { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const message = err.response?.data?.message ?? ''

        if (status === 409) {
          setError('Este email ya está registrado')
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
    <AuthLayout title="Crear cuenta" subtitle="Únete a Nexo y conecta tu trabajo con tu vida.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="field-label">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="field-input"
            placeholder="Tu nombre"
          />
        </div>

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
          <label htmlFor="password" className="field-label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="field-input"
            placeholder="••••••••"
          />
          <PasswordStrengthIndicator password={password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="field-label">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="field-input"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />}
          Crear cuenta
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
