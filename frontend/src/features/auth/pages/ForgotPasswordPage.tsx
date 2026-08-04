import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../../api/auth.api'
import { AuthLayout } from '../components/AuthLayout'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await authApi.forgotPassword(email)
    } catch {
      // Intentionally swallow error — always show generic success message
    } finally {
      setIsLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <AuthLayout title="Restablecer contraseña" subtitle="Te enviaremos las instrucciones a tu correo.">
      {submitted ? (
        <div className="rounded-xl2 border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-relaxed text-emerald-800">
          Si existe una cuenta con ese email, te enviamos instrucciones para restablecer la contraseña.
        </div>
      ) : (
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

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />}
            Enviar instrucciones
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
